/**
 * UI07 — WATCHLISTS (governed persistent lists with triggers).
 *
 * Authority: NP-09 Watchlists Implementation Gate (IRR persistence boundary).
 * Requirement: INT-011a / D4_01 / D4_03:
 *   persistent lists, triggers, score-change detection.
 *
 * Route: /watchlists (viewer+ may read; mutations require analyst-and-above, server-enforced).
 *
 * SCORE-CHANGE SEMANTICS: Deltas compare each item's PERSISTED BASELINE (the
 * governed values observed when it was added) against the CURRENT governed value. This is NOT
 * a live feed and NOT a time series: where values derive from the frozen v1.1 replay baseline
 * every delta is legitimately zero. That is disclosed on the surface rather than hidden.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addWatchlistItem,
  createWatchlist,
  deleteWatchlist,
  fetchWatchlists,
  removeWatchlistItem,
  type WatchlistView,
  type WatchlistsProvenance,
  type WatchlistTrigger,
  type TriggerOperator,
} from '../../api/watchlists';
import { fetchWatchlistQuotes, type WatchlistQuoteEntry, type WatchlistQuotesView } from '../../api/watchlistQuotes';
import { LoadingState, ErrorState, EmptyState } from '../../components/state/StateComponents';

function fmt(v: number | null): string {
  return v === null ? 'unavailable' : String(v);
}

/** Render a delta without pass/fail colour — a delta is not a verdict. */
function Delta({ value }: { value: number | null }) {
  if (value === null) return <span>unavailable</span>;
  return <span>{value > 0 ? `+${value}` : String(value)}</span>;
}

/** Format a price without inventing zero: null -> '—', number -> localized string */
function fmtPrice(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return String(v);
}

/** Freshness badge — truthful, stale never presented as current */
function FreshnessBadge({ freshness }: { freshness: string }) {
  const label =
    freshness === 'SNAPSHOT' ? 'Current' : freshness === 'STALE' ? 'Stale' : freshness === 'UNAVAILABLE' ? 'Unavailable' : freshness;
  const color =
    freshness === 'SNAPSHOT' ? 'var(--color-status-positive)' : freshness === 'STALE' ? 'var(--color-status-warning, #b7791f)' : 'var(--color-status-negative)';
  const testId = `freshness-${freshness.toLowerCase()}`;
  return (
    <span data-testid={testId} style={{ color, fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
  );
}

function QuoteLtp({ entry }: { entry: WatchlistQuoteEntry }) {
  if (entry.value === null) return <span data-testid={`ltp-unavailable-${entry.securityId ?? entry.request.securityId}`}>—</span>;
  return <span data-testid={`ltp-${entry.securityId ?? entry.request.securityId}`}>{fmtPrice(entry.value.ltp)}</span>;
}

function QuoteChange({ entry }: { entry: WatchlistQuoteEntry }) {
  if (entry.value === null) return <span>—</span>;
  const c = entry.value.change;
  const pct = entry.value.pctChange;
  return (
    <span data-testid={`change-${entry.securityId ?? entry.request.securityId}`}>
      {c > 0 ? `+${c}` : String(c)} ({pct > 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`})
    </span>
  );
}

function QuoteStatus({ entry }: { entry: WatchlistQuoteEntry }) {
  if (entry.outcome === 'CURRENT') {
    return <span data-testid={`status-current-${entry.securityId ?? entry.request.securityId}`}>Priced</span>;
  }
  if (entry.outcome === 'STALE') {
    return (
      <span data-testid={`status-stale-${entry.securityId ?? entry.request.securityId}`} style={{ color: 'var(--color-status-warning, #b7791f)' }}>
        Stale — not current
      </span>
    );
  }
  if (entry.outcome === 'UNMAPPED') {
    return (
      <span data-testid={`status-unmapped-${entry.securityId ?? entry.request.securityId}`}>
        Unresolved — {entry.unmapped?.code ?? 'UNRESOLVED_INSTRUMENT'}: {entry.unmapped?.message ?? 'no exact provider mapping'}
      </span>
    );
  }
  if (entry.outcome === 'MALFORMED_IDENTITY') {
    return (
      <span data-testid={`status-malformed-${entry.securityId ?? entry.request.securityId ?? entry.request.companyId}`}>
        Unresolved — {entry.malformedIdentity?.code}: {entry.malformedIdentity?.reason}
      </span>
    );
  }
  // UNAVAILABLE
  const code = entry.unavailable?.code ?? 'UNAVAILABLE';
  const msg = entry.unavailable?.message ?? '';
  const notAttempted = entry.unavailable?.notAttempted ? ' (not attempted — rate limited)' : '';
  return (
    <span data-testid={`status-unavailable-${entry.securityId ?? entry.request.securityId}`}>
      Unavailable — {code}
      {msg ? `: ${msg}` : ''}
      {notAttempted}
    </span>
  );
}

/**
 * W-31 — per-watchlist sourced market-data panel.
 *
 * Fetches quotes for one watchlist through ONE batch endpoint (bounded, rate-limit aware).
 * Ordering is preserved: quotes[i] answers watchlist.items[i]. Unresolved/unavailable items
 * are never rendered as zero, and stale is never presented as current.
 */
function WatchlistMarketDataPanel({ watchlist }: { watchlist: WatchlistView }) {
  const [quotesView, setQuotesView] = useState<WatchlistQuotesView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    if (watchlist.items.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const env = await fetchWatchlistQuotes(watchlist.watchlistId);
      setQuotesView(env.data);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [watchlist.watchlistId, watchlist.items.length]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  if (watchlist.items.length === 0) return null;

  return (
    <div data-testid={`watchlist-quotes-${watchlist.watchlistId}`} style={{ marginTop: 16 }}>
      <h3 style={{ fontSize: 14, margin: '0 0 8px', fontWeight: 600 }}>Market prices (sourced)</h3>
      <p style={{ fontSize: 12, color: 'var(--color-ink-secondary)', margin: '0 0 8px' }}>
        Sourced through the shared quote-consumption boundary. One batch per watchlist (bounded concurrency, rate-limit aware).
        {quotesView?.summary.providerQualification && (
          <span> · Qualification: {quotesView.summary.providerQualification}</span>
        )}
      </p>

      {loading && <p style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>Loading market prices…</p>}
      {error !== null && !loading && <p data-testid={`watchlist-quotes-error-${watchlist.watchlistId}`} style={{ fontSize: 12, color: 'var(--color-status-negative)' }}>{error}</p>}

      {quotesView !== null && (
        <>
          {quotesView.summary.rateLimited && (
            <p data-testid={`watchlist-quotes-rate-limited-${watchlist.watchlistId}`} style={{ fontSize: 12, color: 'var(--color-status-warning, #b7791f)', margin: '0 0 8px' }}>
              Rate limited — some items were not attempted. No retry was performed.
            </p>
          )}
          {!quotesView.summary.transportConfigured && (
            <p data-testid={`watchlist-quotes-not-configured-${watchlist.watchlistId}`} style={{ fontSize: 12, color: 'var(--color-status-negative)', margin: '0 0 8px' }}>
              Market-data transport not configured ({quotesView.summary.transportFailureCode ?? 'NOT_CONFIGURED'}) — no provider request was attempted.
            </p>
          )}
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Security</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>LTP</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Change</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Freshness</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>As of</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.items.map((item, index) => {
                const entry = quotesView.quotes[index];
                if (!entry) return null;
                // Preserve ordering: quotes[index] answers items[index]; verify association by canonicalSecurityId
                return (
                  <tr
                    key={`quote-${item.canonicalSecurityId}-${index}`}
                    data-testid={`watchlist-quote-row-${item.canonicalSecurityId}`}
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <td style={{ padding: '6px 8px' }}>{item.canonicalSecurityId}</td>
                    <td data-testid={`quote-ltp-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                      <QuoteLtp entry={entry} />
                    </td>
                    <td data-testid={`quote-change-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                      <QuoteChange entry={entry} />
                    </td>
                    <td data-testid={`quote-freshness-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                      <FreshnessBadge freshness={entry.freshness} />
                    </td>
                    <td data-testid={`quote-status-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                      <QuoteStatus entry={entry} />
                    </td>
                    <td data-testid={`quote-asof-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                      {entry.asOf ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p
            data-testid={`watchlist-quotes-summary-${watchlist.watchlistId}`}
            style={{ fontSize: 11, color: 'var(--color-ink-secondary)', marginTop: 8 }}
          >
            {quotesView.summary.pricedCount} priced of {quotesView.summary.requestedCount} · {quotesView.summary.counts.CURRENT} current,{' '}
            {quotesView.summary.counts.STALE} stale, {quotesView.summary.counts.UNAVAILABLE} unavailable,{' '}
            {quotesView.summary.counts.UNMAPPED} unresolved (unmapped), {quotesView.summary.counts.MALFORMED_IDENTITY} unresolved (malformed)
            {' · '}worst freshness: {quotesView.summary.worstFreshness} · concurrency: {quotesView.summary.concurrency}
            {quotesView.summary.transportConfigured ? '' : ' · transport not configured'}
          </p>
        </>
      )}
    </div>
  );
}

export function Watchlists() {
  const [lists, setLists] = useState<readonly WatchlistView[] | null>(null);
  const [provenance, setProvenance] = useState<WatchlistsProvenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [itemId, setItemId] = useState('');
  const [triggerField, setTriggerField] = useState('composite');
  const [triggerOp, setTriggerOp] = useState<TriggerOperator>('gt');
  const [triggerVal, setTriggerVal] = useState('');
  const [includeTrigger, setIncludeTrigger] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const env = await fetchWatchlists();
      setLists(env.data);
      setProvenance(env.provenance);
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
  if (error !== null && lists === null) return <ErrorState message={error} />;

  return (
    <section data-testid="watchlists-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>Watchlists</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Persistent lists of governed securities with user-defined triggers. Your lists only.
      </p>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          data-testid="watchlist-new-id"
          placeholder="watchlist id"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
        />
        <input
          data-testid="watchlist-new-name"
          placeholder="name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="button"
          data-testid="watchlist-create"
          disabled={newId.trim() === ''}
          onClick={() => { void run(async () => { await createWatchlist(newId, newName); setNewId(''); setNewName(''); }); }}
        >
          Create watchlist
        </button>
      </div>

      {error !== null && <p data-testid="watchlists-error" style={{ fontSize: 13, color: 'var(--color-status-negative)' }}>{error}</p>}

      {lists !== null && lists.length === 0 && <EmptyState label="No watchlists yet" />}

      {(lists ?? []).map((list) => (
        <article
          key={list.watchlistId}
          data-testid={`watchlist-${list.watchlistId}`}
          style={{ marginTop: 24, border: '1px solid var(--color-border)', borderRadius: 6, padding: 12 }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>{list.name}</h2>
            <span style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>{list.totalItems} item(s)</span>
            <button
              type="button"
              data-testid={`watchlist-delete-${list.watchlistId}`}
              onClick={() => { void run(() => deleteWatchlist(list.watchlistId)); }}
            >
              Delete
            </button>
          </header>

          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              data-testid={`watchlist-add-id-${list.watchlistId}`}
              placeholder="certified reference identifier (e.g. Technology)"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              aria-label="Certified reference identifier"
            />
            <p data-testid={`watchlist-add-help-${list.watchlistId}`} style={{ flexBasis: '100%', fontSize: 12, margin: '2px 0 0', color: 'var(--color-ink-secondary)' }}>
              Membership is the host's certified reference universe (sector reference identifiers such as “Technology”) — not an issuer ticker or ISIN.
            </p>
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="checkbox"
                checked={includeTrigger}
                onChange={(e) => setIncludeTrigger(e.target.checked)}
              />
              Add trigger
            </label>
            {includeTrigger && (
              <>
                <select
                  value={triggerField}
                  onChange={(e) => setTriggerField(e.target.value)}
                  style={{ fontSize: 12 }}
                >
                  <option value="composite">composite</option>
                  <option value="qualityAxis">qualityAxis</option>
                  <option value="valuation">valuation</option>
                </select>
                <select
                  value={triggerOp}
                  onChange={(e) => setTriggerOp(e.target.value as TriggerOperator)}
                  style={{ fontSize: 12 }}
                >
                  <option value="gt">&gt;</option>
                  <option value="gte">&gt;=</option>
                  <option value="lt">&lt;</option>
                  <option value="lte">&lt;=</option>
                  <option value="eq">==</option>
                  <option value="changed">changed</option>
                </select>
                {triggerOp !== 'changed' && (
                  <input
                    type="number"
                    placeholder="value"
                    style={{ width: 60, fontSize: 12 }}
                    value={triggerVal}
                    onChange={(e) => setTriggerVal(e.target.value)}
                  />
                )}
              </>
            )}
            <button
              type="button"
              data-testid={`watchlist-add-${list.watchlistId}`}
              disabled={itemId.trim() === ''}
              onClick={() => {
                void run(async () => {
                  const triggers: WatchlistTrigger[] = [];
                  if (includeTrigger) {
                    triggers.push({
                      field: triggerField,
                      op: triggerOp,
                      value: triggerOp === 'changed' ? null : Number(triggerVal || 0),
                    });
                  }
                  await addWatchlistItem(list.watchlistId, itemId, triggers);
                  setItemId('');
                  setIncludeTrigger(false);
                  setTriggerVal('');
                });
              }}
            >
              Add security
            </button>
          </div>

          {list.items.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-ink-secondary)', marginTop: 8 }}>No securities in this list.</p>
          ) : (
            <table style={{ width: '100%', marginTop: 12, fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Security</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Baseline</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Current</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Change</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Triggers</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px' }}>Research</th>
                  <th style={{ textAlign: 'right', padding: '4px 8px' }} />
                </tr>
              </thead>
              <tbody>
                {list.items.map((item) => {
                  const composite = item.deltas.find((d) => d.field === 'composite');
                  return (
                    <tr key={item.canonicalSecurityId} data-testid={`watchlist-item-${item.canonicalSecurityId}`} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '6px 8px' }}>
                        {item.canonicalSecurityId}
                        {item._quality !== undefined && (
                          <span style={{ color: 'var(--color-ink-secondary)' }}> · quality {item._quality}</span>
                        )}
                      </td>
                      <td data-testid={`baseline-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                        {fmt(composite?.baselineValue ?? null)}
                      </td>
                      <td data-testid={`current-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                        {fmt(composite?.currentValue ?? null)}
                      </td>
                      <td data-testid={`delta-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                        <Delta value={composite?.delta ?? null} />
                      </td>
                      <td data-testid={`triggers-${item.canonicalSecurityId}`} style={{ padding: '6px 8px' }}>
                        {item.triggers.length === 0
                          ? 'none'
                          : item.triggers
                              .map((t) => `${t.field} ${t.op}${t.value === null ? '' : ` ${t.value}`}: ${t.fired === null ? 'not evaluated' : t.fired ? 'FIRED' : 'not fired'}`)
                              .join(' · ')}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Link
                          to={`/research/company/${encodeURIComponent(item.canonicalSecurityId)}`}
                          data-testid={`watchlist-research-${item.canonicalSecurityId}`}
                          style={{ color: 'var(--color-brand)', textDecoration: 'none' }}
                        >
                          Company Research
                        </Link>
                      </td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>
                        <button
                          type="button"
                          data-testid={`watchlist-remove-${item.canonicalSecurityId}`}
                          onClick={() => { void run(() => removeWatchlistItem(list.watchlistId, item.canonicalSecurityId)); }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <WatchlistMarketDataPanel watchlist={list} />
        </article>
      ))}

      {provenance !== null && (
        <p data-testid="watchlists-provenance" style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 20 }}>
          {provenance.dataSource} · as of {provenance.asOf} · {provenance.mode}
          <br />
          {provenance.transportSemantics}
        </p>
      )}
    </section>
  );
}

export default Watchlists;
