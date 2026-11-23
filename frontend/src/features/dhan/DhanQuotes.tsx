/**
 * DHAN-P3 / W-15 — DHAN QUOTES (read-only market quotes over the IPD market-data transport).
 *
 * IPD remains the market-data authority. This component is the PRESENTATION layer: it sends
 * a canonical request to the IRR server, which forwards it to IPD, and it renders exactly
 * what IPD answered. It computes no price, no change, no percentage and no freshness verdict.
 *
 * THE FRESHNESS RULE
 *   The freshness badge shows IRR's `Freshness` vocabulary as the SERVER resolved it from
 *   IPD's canonical quality verdict. A `STALE` quote is never rendered as current, and the
 *   component never produces `LIVE` itself. The provider observation timestamp (`asOf`) is
 *   shown separately from the receipt/evaluation timestamps, so a reader can always see how
 *   old the observation is.
 *
 * THE IDENTITY RULE (W-15)
 *   A quote requires an exact canonical D114 identity (`ISIN:<isin>:<series>`). The identity
 *   is NEVER typed by hand: the operator searches IPD's existing instrument-search endpoint
 *   (`/api/dhan/instruments/search`, forwarded to IPD's `/v1/instruments/search`) and SELECTS
 *   a QUALIFIED result. Selecting a result populates `companyId`, the canonical `securityId`
 *   and the exchange segment verbatim from the search result; the exact-identity grammar is
 *   still validated locally before any request is built, and a request is never issued
 *   without a valid canonical identity. When the identity is missing or invalid, the server
 *   answers with an IDENTITY failure and this surface says so explicitly — it does NOT
 *   present an "unavailable market data" message for what is really an identity problem.
 *
 * HONEST FIELD RENDERING (W-13 / D-5)
 *   Absent bid/ask (null after D-5) render as "unavailable" via `MetricCard` — never 0, never
 *   the last traded price, never a fabricated value.
 */
import { useCallback, useState } from 'react';
import {
  fetchDhanQuote,
  DhanMarketDataApiError,
  type DhanQuoteDto,
  type DhanQuoteRequest,
  type DhanMarketDataFailureKind,
} from '../../api/dhanMarketData';
import {
  DhanIdentityApiError,
  searchDhanInstruments,
  type InstrumentSearchResult,
} from '../../api/dhanIdentity';
import { MetricCard, MetricGroup } from '../../components/data/DataComponents';
import { FreshnessBadge, StatusBadge } from '../../components/ui/Badges';
import { LoadingState, UnavailableState } from '../../components/state/StateComponents';
import { DhanFreshnessPanel } from './DhanFreshnessStatus';

/** The canonical identity grammar, mirrored for the client-side validation only. */
const D114_SECURITY_ID_PATTERN = /^ISIN:[A-Za-z0-9]{12}:[^:\s]+$/;

/** Maps a search result's listing exchange onto the quote request's exchange segment. */
export function exchangeSegmentFor(exchange: 'NSE' | 'BSE'): 'NSE_EQ' | 'BSE_EQ' {
  return exchange === 'BSE' ? 'BSE_EQ' : 'NSE_EQ';
}

/**
 * Builds the well-formed canonical quote request from a selected identity.
 *
 * Returns null unless BOTH the company id is non-empty AND the security id matches the exact
 * D114 grammar — the same validation the server applies before any provider invocation. The
 * selected identity is passed through verbatim; nothing is re-derived or normalised.
 */
export function buildDhanQuoteRequest(
  companyId: string,
  securityId: string,
  exchangeSegment: 'NSE_EQ' | 'BSE_EQ' | '',
): DhanQuoteRequest | null {
  const company = companyId.trim();
  const security = securityId.trim();
  if (!company || !D114_SECURITY_ID_PATTERN.test(security)) return null;
  return { companyId: company, securityId: security, ...(exchangeSegment === '' ? {} : { exchangeSegment }) };
}

const FAILURE_LABEL: Record<DhanMarketDataFailureKind, string> = {
  request: 'Request rejected',
  transport: 'Transport unavailable',
  unavailable: 'Data unavailable',
};

function failureOf(e: unknown): { kind: DhanMarketDataFailureKind; message: string } {
  if (e instanceof DhanMarketDataApiError) return { kind: e.kind, message: e.message };
  return { kind: 'transport', message: String(e) };
}

/** Formats a number for display, or 'unavailable' when it is not a usable number. */
function num(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Renders an ISO timestamp for display, or 'unavailable' when absent. */
function stamp(value: string | null): string {
  return value === null || value === '' ? 'unavailable' : value;
}

/** A selectable instrument-search row. Only QUALIFIED outcomes can be selected. */
function SearchResultRow({
  row,
  onPick,
}: {
  readonly row: InstrumentSearchResult;
  readonly onPick: (row: InstrumentSearchResult) => void;
}) {
  const qualified = row.result.status === 'QUALIFIED';
  return (
    <li data-testid="dhan-quote-search-row" data-symbol={row.symbol} data-exchange={row.exchange} data-outcome={row.result.status}>
      <span>{row.symbol} · {row.exchange} · {row.result.status}</span>
      {qualified && (
        <button
          type="button"
          data-testid="dhan-quote-pick"
          data-symbol={row.symbol}
          data-exchange={row.exchange}
          onClick={() => onPick(row)}
        >
          Use this instrument
        </button>
      )}
    </li>
  );
}

export function DhanQuotes() {
  const [query, setQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<readonly InstrumentSearchResult[] | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [exchangeSegment, setExchangeSegment] = useState<'NSE_EQ' | 'BSE_EQ' | ''>('');
  const [quote, setQuote] = useState<DhanQuoteDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<{ kind: DhanMarketDataFailureKind; message: string } | null>(null);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    // Exact-identity validation is preserved at request construction: no well-formed
    // request exists without a canonical identity, and none is sent.
    const request = buildDhanQuoteRequest(companyId, securityId, exchangeSegment);
    setLoading(true);
    setFailure(null);
    if (request === null) {
      setQuote(null);
      setRequested(true);
      setLoading(false);
      setFailure({ kind: 'request', message: 'A canonical identity (ISIN:<isin>:<series>) is required. Select an instrument from the search results.' });
      return;
    }
    try {
      const result = await fetchDhanQuote(request);
      setQuote(result);
    } catch (e: unknown) {
      // A failed request never leaves a previous quote on screen pretending to be current.
      setQuote(null);
      setFailure(failureOf(e));
    } finally {
      setLoading(false);
      setRequested(true);
    }
  }, [companyId, securityId, exchangeSegment]);

  const search = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setSearchBusy(true);
    setSearchError('');
    try {
      const response = await searchDhanInstruments(q);
      setSearchResults(response.results);
    } catch (e: unknown) {
      setSearchResults(null);
      setSearchError(e instanceof DhanIdentityApiError ? e.message : 'Instrument search is unavailable.');
    } finally {
      setSearchBusy(false);
    }
  }, [query]);

  /** Selecting a search result populates the quote request fields verbatim from it. */
  const pick = useCallback((row: InstrumentSearchResult) => {
    if (row.result.status !== 'QUALIFIED') return;
    setCompanyId(row.result.companyId);
    setSecurityId(row.result.securityIdentity.securityId);
    setExchangeSegment(exchangeSegmentFor(row.exchange));
    setQuote(null);
    setFailure(null);
  }, []);

  const identityLooksValid = D114_SECURITY_ID_PATTERN.test(securityId.trim()) && companyId.trim() !== '';

  return (
    <section data-testid="dhan-quotes-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Quotes</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Quotes are read from the IPD market-data service, which remains the market-data
        authority. The browser sends a canonical request only; it never computes a price and
        never holds a credential. The instrument identity comes from IPD's instrument search —
        select a result instead of typing an ISIN.
      </p>

      <form
        data-testid="dhan-quote-form"
        style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 560 }}
        onSubmit={(e) => { e.preventDefault(); void load(); }}
      >
        <label htmlFor="dhan-quote-search-query" style={{ fontSize: 13 }}>Search instrument (symbol or ISIN)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="dhan-quote-search-query"
            data-testid="dhan-quote-search-query"
            value={query}
            maxLength={100}
            placeholder="e.g. RELIANCE or INE002A01018"
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, flex: 1 }}
          />
          <button
            type="button"
            data-testid="dhan-quote-search-submit"
            disabled={searchBusy || !query.trim()}
            onClick={() => { void search(); }}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            {searchBusy ? 'Searching…' : 'Search'}
          </button>
        </div>

        {searchError !== '' && (
          <p data-testid="dhan-quote-search-error" role="alert" style={{ color: 'var(--color-status-negative)', fontSize: 13 }}>
            {searchError}
          </p>
        )}

        {searchResults !== null && searchResults.length === 0 && (
          <p data-testid="dhan-quote-search-empty" style={{ fontSize: 13 }}>No instrument candidates were returned by IPD.</p>
        )}

        {searchResults !== null && searchResults.length > 0 && (
          <ul data-testid="dhan-quote-search-results" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
            {searchResults.map((row, index) => (
              <SearchResultRow key={`${row.symbol}-${row.exchange}-${index}`} row={row} onPick={pick} />
            ))}
          </ul>
        )}

        <label htmlFor="dhan-quote-selected" style={{ fontSize: 13 }}>Selected instrument</label>
        <output
          id="dhan-quote-selected"
          data-testid="dhan-quote-selected"
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, minHeight: 18 }}
        >
          {identityLooksValid
            ? `${companyId.trim()} · ${securityId.trim()} · ${exchangeSegment === '' ? 'default segment' : exchangeSegment}`
            : 'none — select a QUALIFIED search result'}
        </output>

        <label htmlFor="dhan-quote-segment" style={{ fontSize: 13 }}>Exchange segment</label>
        <select
          id="dhan-quote-segment"
          data-testid="dhan-quote-segment"
          value={exchangeSegment}
          onChange={(e) => setExchangeSegment(e.target.value as 'NSE_EQ' | 'BSE_EQ' | '')}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        >
          <option value="">(default)</option>
          <option value="NSE_EQ">NSE_EQ</option>
          <option value="BSE_EQ">BSE_EQ</option>
        </select>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <button
            type="submit"
            data-testid="dhan-quote-submit"
            disabled={loading || !identityLooksValid}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            {loading ? 'Loading…' : 'Get quote'}
          </button>
          {!identityLooksValid && (
            <span data-testid="dhan-quote-identity-hint" style={{ fontSize: 12, color: 'var(--color-status-warning)' }}>
              A canonical identity (ISIN:&lt;isin&gt;:&lt;series&gt;) is required — select a search result.
            </span>
          )}
        </div>
      </form>

      {loading && <div style={{ marginTop: 16 }}><LoadingState /></div>}

      {!loading && requested && failure !== null && (
        <div style={{ marginTop: 16 }}>
          <p
            data-testid="dhan-quote-failure"
            role="alert"
            style={{ color: 'var(--color-status-negative)', fontSize: 13 }}
          >
            <strong data-testid="dhan-quote-failure-kind">{FAILURE_LABEL[failure.kind]}</strong>: {failure.message}
          </p>
          <button type="button" data-testid="dhan-quote-retry" onClick={() => { void load(); }}>
            Retry
          </button>
        </div>
      )}

      {!loading && requested && failure === null && quote === null && (
        <div style={{ marginTop: 16 }}>
          <UnavailableState reason="No quote" />
        </div>
      )}

      {!loading && quote !== null && (
        <div data-testid="dhan-quote-result" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <FreshnessBadge state={quote.freshness.toLowerCase() as 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay'} />
            <StatusBadge
              status={quote.freshness === 'UNAVAILABLE' ? 'negative' : quote.freshness === 'STALE' ? 'warning' : 'informational'}
              label={`Quality: ${quote.qualityState}`}
            />
            <span data-testid="dhan-quote-symbol" style={{ fontSize: 15, fontWeight: 600 }}>
              {quote.quote?.symbol ?? 'unavailable'} · {quote.quote?.exchange ?? 'unavailable'}
            </span>
          </div>

          {quote.freshness === 'STALE' && (
            <p data-testid="dhan-quote-stale-notice" style={{ color: 'var(--color-status-warning)', fontSize: 13 }}>
              This observation is STALE. It is not a current price.
            </p>
          )}
          {quote.freshness === 'UNAVAILABLE' && (
            <p data-testid="dhan-quote-unavailable-notice" style={{ color: 'var(--color-status-negative)', fontSize: 13 }}>
              The request succeeded, but this observation is outside the freshness-use policy. It is not a current price.
            </p>
          )}

          <MetricGroup label="Quote">
            <MetricCard label="Last traded" value={num(quote.quote?.ltp)} unit={quote.quote?.currency} />
            <MetricCard label="Open" value={num(quote.quote?.open)} />
            <MetricCard label="High" value={num(quote.quote?.high)} />
            <MetricCard label="Low" value={num(quote.quote?.low)} />
            <MetricCard label="Previous close" value={num(quote.quote?.previousClose)} />
            <MetricCard label="Volume" value={num(quote.quote?.volume)} />
            {/* D-5 / W-13: an absent bid or ask is null, and MetricCard renders null as
                "unavailable" — never 0, never the last traded price. */}
            <MetricCard label="Bid" value={num(quote.quote?.bid)} />
            <MetricCard label="Ask" value={num(quote.quote?.ask)} />
            <MetricCard label="VWAP" value={num(quote.quote?.vwap)} />
            <MetricCard
              label="Change"
              value={num(quote.quote?.change)}
              direction={
                quote.quote && quote.quote.change > 0 ? 'positive' : quote.quote && quote.quote.change < 0 ? 'negative' : 'neutral'
              }
            />
            <MetricCard label="Change %" value={num(quote.quote?.pctChange)} />
          </MetricGroup>

          <dl
            data-testid="dhan-quote-provenance"
            style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
          >
            <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider observation (asOf)</dt>
            <dd data-testid="dhan-quote-as-of" style={{ margin: 0 }}>{stamp(quote.asOf)}</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Received at</dt>
            <dd data-testid="dhan-quote-received-at" style={{ margin: 0 }}>{stamp(quote.receivedAt)}</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Evaluated at</dt>
            <dd data-testid="dhan-quote-evaluated-at" style={{ margin: 0 }}>{stamp(quote.evaluatedAt)}</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Security identity</dt>
            <dd data-testid="dhan-quote-security-id" style={{ margin: 0 }}>{quote.securityId ?? 'unavailable'}</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Source classification</dt>
            <dd data-testid="dhan-quote-source-classification" style={{ margin: 0 }}>
              {quote.provenance?.sourceClassification ?? 'unavailable'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Data version</dt>
            <dd data-testid="dhan-quote-data-version" style={{ margin: 0 }}>
              {quote.provenance?.dataVersion ?? 'unavailable'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Lineage digest</dt>
            <dd data-testid="dhan-quote-lineage-hash" style={{ margin: 0 }}>
              {quote.provenance?.lineageHash ?? 'unavailable'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider qualification</dt>
            <dd data-testid="dhan-quote-qualification" style={{ margin: 0 }}>
              {quote.providerQualification ?? 'unavailable'}
            </dd>
          </dl>

          {/* The provider-side freshness verdict for this exact quote scope. It is the
              authoritative statement about how fresh the observation is, and it is shown
              next to the quote's own freshness badge rather than replacing it. */}
          <DhanFreshnessPanel
            status={quote.freshnessStatus ?? null}
            failure={quote.freshnessStatusFailure ?? null}
            heading="Provider freshness (D01_QUOTES)"
          />
        </div>
      )}
    </section>
  );
}

export default DhanQuotes;
