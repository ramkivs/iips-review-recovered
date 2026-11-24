/**
 * DHAN-P3 / D-4.6 — DHAN HISTORICAL DATA (read-only OHLCV over the IPD market-data transport).
 *
 * IPD remains the market-data authority: IPD resolves the instrument, normalizes the vendor
 * payload into canonical candles and reports its own coverage claim. This component is the
 * PRESENTATION layer — it renders exactly the candles IPD returned and computes no
 * indicator, average, return or derived series of its own.
 *
 * THE IDENTITY RULE (D-4.6 SYMMETRY WITH D01 QUOTES)
 *   Historical requests require the exact same canonical 3-tuple as quotes:
 *   `(companyId, securityId: 'ISIN:<isin>:<series>', exchangeSegment: 'NSE_EQ' | 'BSE_EQ')`.
 *   The identity is NEVER typed as free-text `companyId` or bare `isin`: the operator
 *   searches IPD's instrument-search endpoint (`/api/dhan/instruments/search`) and selects
 *   a `QUALIFIED` result, populating `(companyId, securityId, exchangeSegment)` verbatim
 *   with no silent fallback between `NSE_EQ` and `BSE_EQ`.
 *
 * THE CONTRACT PRESERVED HERE
 *   - The supported intervals are IPD's: `1m`, `5m`, `15m`, `1h`, `1D`.
 *   - The date range is INCLUSIVE on both ends, exactly as IPD computes it.
 *   - The maximum window is IPD's 1,825 days. The range is validated in the browser as a
 *     UX affordance; IPD re-validates and remains the authority.
 *
 * THE EMPTY CASE
 *   A returned series with zero candles is a VALID, EXPLICIT outcome: IPD distinguishes "no
 *   candles in range" from a malformed payload, and reports the returned count. The surface
 *   states the count rather than inventing a placeholder.
 */
import { useCallback, useState } from 'react';
import {
  fetchDhanHistorical,
  DhanMarketDataApiError,
  type DhanHistoricalDto,
  type DhanMarketDataFailureKind,
} from '../../api/dhanMarketData';
import {
  fetchEquiCoreHistorical,
  EquiCoreHistoricalApiError,
  type EquiCoreBarDto,
  type EquiCoreHistoricalDto,
  type HistoricalSourceChoice,
} from '../../api/equicoreHistorical';
import {
  DhanIdentityApiError,
  searchDhanInstruments,
  type InstrumentSearchResult,
} from '../../api/dhanIdentity';
import { DataTable, type Column } from '../../components/data/DataComponents';
import { FreshnessBadge, StatusBadge } from '../../components/ui/Badges';
import { LoadingState, UnavailableState } from '../../components/state/StateComponents';
import { DhanFreshnessPanel } from './DhanFreshnessStatus';
import {
  buildDhanHistoricalRequest,
  canonicalIdentityFromSearchRow,
  exchangeSegmentFor,
  type DhanExchangeSegment,
} from './dhanCanonicalIdentity';

export { buildDhanHistoricalRequest, exchangeSegmentFor };

/** IPD's supported historical intervals. */
const INTERVALS = ['1m', '5m', '15m', '1h', '1D'] as const;
type Interval = (typeof INTERVALS)[number];

/** IPD's maximum historical window, in days. */
const MAX_WINDOW_DAYS = 1825;

const FAILURE_LABEL: Record<DhanMarketDataFailureKind, string> = {
  request: 'Request rejected',
  transport: 'Transport unavailable',
  unavailable: 'Data unavailable',
};

function failureOf(e: unknown): { kind: DhanMarketDataFailureKind; message: string } {
  if (e instanceof DhanMarketDataApiError) return { kind: e.kind, message: e.message };
  if (e instanceof EquiCoreHistoricalApiError) return { kind: e.kind, message: e.message };
  return { kind: 'transport', message: String(e) };
}

const EQUICORE_BAR_COLUMNS: readonly Column<EquiCoreBarDto>[] = [
  { key: 'businessDate', header: 'Business date', render: (row) => row.businessDate },
  { key: 'observedSymbol', header: 'Symbol', render: (row) => row.observedSymbol ?? 'unavailable' },
  { key: 'series', header: 'Series', render: (row) => row.series ?? 'unavailable' },
  { key: 'open', header: 'Open', render: (row) => row.open ?? 'unavailable' },
  { key: 'high', header: 'High', render: (row) => row.high ?? 'unavailable' },
  { key: 'low', header: 'Low', render: (row) => row.low ?? 'unavailable' },
  { key: 'close', header: 'Close', render: (row) => row.close ?? 'unavailable' },
  { key: 'volume', header: 'Volume', render: (row) => row.volume ?? 'unavailable' },
  { key: 'isinValidity', header: 'ISIN validity', render: (row) => row.isinValidity ?? 'unavailable' },
  { key: 'isAdjusted', header: 'Adjusted', render: () => 'no (RAW_UNADJUSTED)' },
];

/**
 * Validates the requested range with IPD's inclusive semantics, calendar validity, and
 * maximum window.
 *
 * This is a UX affordance, not a re-implementation of IPD's validation: it exists so an
 * invalid range is reported before the request leaves the browser. IPD remains the
 * authority and re-validates the same rules server-side.
 */
export function validateHistoricalRange(fromDate: string, toDate: string): string | null {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDate.test(fromDate) || !isoDate.test(toDate)) {
    return 'Both dates must be ISO calendar dates (YYYY-MM-DD).';
  }
  const fromMs = Date.parse(`${fromDate}T00:00:00.000Z`);
  const toMs = Date.parse(`${toDate}T00:00:00.000Z`);
  if (
    Number.isNaN(fromMs) ||
    Number.isNaN(toMs) ||
    new Date(fromMs).toISOString().slice(0, 10) !== fromDate ||
    new Date(toMs).toISOString().slice(0, 10) !== toDate
  ) {
    return 'Both dates must be valid calendar dates.';
  }
  if (fromMs > toMs) {
    return 'The start date must not be after the end date.';
  }
  const spanDays = Math.round((toMs - fromMs) / 86_400_000) + 1;
  if (spanDays > MAX_WINDOW_DAYS) {
    return `The requested window of ${spanDays} days exceeds the maximum of ${MAX_WINDOW_DAYS} days.`;
  }
  return null;
}

const CANDLE_COLUMNS: readonly Column<DhanHistoricalDto['candles'][number]>[] = [
  { key: 'candleStart', header: 'Candle start (UTC)', render: (row) => row.candleStart },
  { key: 'interval', header: 'Interval', render: (row) => row.interval },
  { key: 'open', header: 'Open', render: (row) => row.open },
  { key: 'high', header: 'High', render: (row) => row.high },
  { key: 'low', header: 'Low', render: (row) => row.low },
  { key: 'close', header: 'Close', render: (row) => row.close },
  { key: 'volume', header: 'Volume', render: (row) => row.volume },
  { key: 'vwap', header: 'VWAP', render: (row) => row.vwap ?? 'unavailable' },
  { key: 'isAdjusted', header: 'Adjusted', render: (row) => (row.isAdjusted ? 'yes' : 'no') },
];

/** A selectable instrument-search row. Only QUALIFIED outcomes can be selected. */
function HistoricalSearchResultRow({
  row,
  onPick,
}: {
  readonly row: InstrumentSearchResult;
  readonly onPick: (row: InstrumentSearchResult) => void;
}) {
  const qualified = canonicalIdentityFromSearchRow(row) !== null;
  return (
    <li
      data-testid="dhan-historical-search-row"
      data-symbol={row.symbol}
      data-exchange={row.exchange}
      data-outcome={row.result.status}
    >
      <span>{row.symbol} · {row.exchange} · {row.result.status}</span>
      {qualified && (
        <button
          type="button"
          data-testid="dhan-historical-pick"
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

export function DhanHistorical() {
  const [source, setSource] = useState<HistoricalSourceChoice>('DHAN_D02_OHLCV');
  const [query, setQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<readonly InstrumentSearchResult[] | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [exchangeSegment, setExchangeSegment] = useState<DhanExchangeSegment | ''>('');
  const [interval, setInterval] = useState<Interval>('1D');
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-31');
  const [result, setResult] = useState<DhanHistoricalDto | null>(null);
  const [equicoreResult, setEquicoreResult] = useState<EquiCoreHistoricalDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<{ kind: DhanMarketDataFailureKind; message: string } | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    const trimmedFrom = fromDate.trim();
    const trimmedTo = toDate.trim();
    const rangeProblem = source === 'DHAN_D02_OHLCV'
      ? validateHistoricalRange(trimmedFrom, trimmedTo)
      : (() => {
          const iso = /^\d{4}-\d{2}-\d{2}$/;
          if (!iso.test(trimmedFrom) || !iso.test(trimmedTo)) {
            return 'Both dates must be ISO calendar dates (YYYY-MM-DD).';
          }
          if (Date.parse(`${trimmedFrom}T00:00:00.000Z`) > Date.parse(`${trimmedTo}T00:00:00.000Z`)) {
            return 'The start date must not be after the end date.';
          }
          return null;
        })();
    setRangeError(rangeProblem);
    if (rangeProblem !== null) {
      // An invalid range never leaves the browser.
      setResult(null);
      setEquicoreResult(null);
      setFailure(null);
      setRequested(true);
      return;
    }

    const request = buildDhanHistoricalRequest(
      companyId,
      securityId,
      exchangeSegment,
      interval,
      trimmedFrom,
      trimmedTo,
    );
    if (request === null) {
      setResult(null);
      setEquicoreResult(null);
      setRequested(true);
      setLoading(false);
      setFailure({
        kind: 'request',
        message:
          'A canonical identity (companyId, ISIN:<isin>:<series>, exchangeSegment) is required. Select an instrument from the search results.',
      });
      return;
    }

    if (source === 'EQUICORE_NSE_EOD') {
      if (request.exchangeSegment !== 'NSE_EQ') {
        setResult(null);
        setEquicoreResult(null);
        setRequested(true);
        setLoading(false);
        setFailure({
          kind: 'request',
          message:
            'EQUICORE_NSE_EOD serves NSE_EQ only; BSE_EQ is rejected without falling back to DHAN_D02_OHLCV.',
        });
        return;
      }
      if (request.interval !== '1D') {
        setResult(null);
        setEquicoreResult(null);
        setRequested(true);
        setLoading(false);
        setFailure({
          kind: 'request',
          message:
            'EQUICORE_NSE_EOD serves daily (1D) bars only; intraday intervals are rejected without falling back to DHAN_D02_OHLCV.',
        });
        return;
      }
      setLoading(true);
      setFailure(null);
      setResult(null);
      try {
        const data = await fetchEquiCoreHistorical({
          source: 'EQUICORE_NSE_EOD',
          companyId: request.companyId,
          securityId: request.securityId,
          exchangeSegment: 'NSE_EQ',
          interval: '1D',
          fromDate: request.fromDate,
          toDate: request.toDate,
          adjustmentMode: 'RAW_UNADJUSTED',
        });
        setEquicoreResult(data);
      } catch (e: unknown) {
        setEquicoreResult(null);
        setFailure(failureOf(e));
      } finally {
        setLoading(false);
        setRequested(true);
      }
      return;
    }

    setLoading(true);
    setFailure(null);
    setEquicoreResult(null);
    try {
      const data = await fetchDhanHistorical(request);
      setResult(data);
    } catch (e: unknown) {
      setResult(null);
      setFailure(failureOf(e));
    } finally {
      setLoading(false);
      setRequested(true);
    }
  }, [source, companyId, securityId, exchangeSegment, interval, fromDate, toDate]);

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

  /** Selecting a search result populates the historical request fields verbatim from it. */
  const pick = useCallback((row: InstrumentSearchResult) => {
    const selected = canonicalIdentityFromSearchRow(row);
    if (selected === null) return;
    setCompanyId(selected.companyId);
    setSecurityId(selected.securityId);
    setExchangeSegment(selected.exchangeSegment);
    setResult(null);
    setEquicoreResult(null);
    setFailure(null);
  }, []);

  const identityLooksValid =
    buildDhanHistoricalRequest(
      companyId,
      securityId,
      exchangeSegment,
      interval,
      fromDate.trim(),
      toDate.trim(),
    ) !== null;

  return (
    <section data-testid="dhan-historical-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Historical Data</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Historical OHLCV is read from the IPD market-data service, which normalizes the
        provider payload into canonical candles. The date range is inclusive on both ends and
        spans at most {MAX_WINDOW_DAYS} days. Select a qualified instrument from search so
        company id, canonical security id, and exchange segment match D01 quotes identically.
      </p>

      <form
        data-testid="dhan-historical-form"
        style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 560 }}
        onSubmit={(e) => { e.preventDefault(); void load(); }}
      >
        <label htmlFor="historical-source-select" style={{ fontSize: 13 }}>Historical data source (explicit, no silent fallback)</label>
        <select
          id="historical-source-select"
          data-testid="historical-source-select"
          value={source}
          onChange={(e) => {
            const next = e.target.value as HistoricalSourceChoice;
            setSource(next);
            setResult(null);
            setEquicoreResult(null);
            setFailure(null);
            setRangeError(null);
            if (next === 'EQUICORE_NSE_EOD') {
              setInterval('1D');
            }
          }}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        >
          <option value="DHAN_D02_OHLCV">DHAN_D02_OHLCV (IPD D02 · NSE_EQ / BSE_EQ · 1m..1D)</option>
          <option value="EQUICORE_NSE_EOD">EQUICORE_NSE_EOD (EquiCore M2 · NSE_EQ · 1D · RAW_UNADJUSTED)</option>
        </select>

        <label htmlFor="dhan-historical-search-query" style={{ fontSize: 13 }}>Search instrument (symbol or ISIN)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="dhan-historical-search-query"
            data-testid="dhan-historical-search-query"
            value={query}
            maxLength={100}
            placeholder="e.g. RELIANCE or INE002A01018"
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, flex: 1 }}
          />
          <button
            type="button"
            data-testid="dhan-historical-search-submit"
            disabled={searchBusy || !query.trim()}
            onClick={() => { void search(); }}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            {searchBusy ? 'Searching…' : 'Search'}
          </button>
        </div>

        {searchError !== '' && (
          <p data-testid="dhan-historical-search-error" role="alert" style={{ color: 'var(--color-status-negative)', fontSize: 13 }}>
            {searchError}
          </p>
        )}

        {searchResults !== null && searchResults.length === 0 && (
          <p data-testid="dhan-historical-search-empty" style={{ fontSize: 13 }}>No instrument candidates were returned by IPD.</p>
        )}

        {searchResults !== null && searchResults.length > 0 && (
          <ul data-testid="dhan-historical-search-results" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
            {searchResults.map((row, index) => (
              <HistoricalSearchResultRow key={`${row.symbol}-${row.exchange}-${index}`} row={row} onPick={pick} />
            ))}
          </ul>
        )}

        <label htmlFor="dhan-historical-selected" style={{ fontSize: 13 }}>Selected instrument</label>
        <output
          id="dhan-historical-selected"
          data-testid="dhan-historical-selected"
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, minHeight: 18 }}
        >
          {identityLooksValid
            ? `${companyId.trim()} · ${securityId.trim()} · ${exchangeSegment}`
            : 'none — select a QUALIFIED search result'}
        </output>

        <label htmlFor="dhan-historical-segment" style={{ fontSize: 13 }}>Exchange segment</label>
        <select
          id="dhan-historical-segment"
          data-testid="dhan-historical-segment"
          value={exchangeSegment}
          disabled
          aria-readonly="true"
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        >
          <option value="">(select a qualified instrument)</option>
          <option value="NSE_EQ">NSE_EQ</option>
          <option value="BSE_EQ">BSE_EQ</option>
        </select>

        <label htmlFor="dhan-historical-interval" style={{ fontSize: 13 }}>Interval</label>
        <select
          id="dhan-historical-interval"
          data-testid="dhan-historical-interval"
          value={interval}
          onChange={(e) => setInterval(e.target.value as Interval)}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        >
          {INTERVALS.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>

        <label htmlFor="dhan-historical-from" style={{ fontSize: 13 }}>From (inclusive)</label>
        <input
          id="dhan-historical-from"
          data-testid="dhan-historical-from"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        />

        <label htmlFor="dhan-historical-to" style={{ fontSize: 13 }}>To (inclusive)</label>
        <input
          id="dhan-historical-to"
          data-testid="dhan-historical-to"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <button
            type="submit"
            data-testid="dhan-historical-submit"
            disabled={loading || !identityLooksValid}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            {loading ? 'Loading…' : 'Get history'}
          </button>
          {!identityLooksValid && (
            <span data-testid="dhan-historical-identity-hint" style={{ fontSize: 12, color: 'var(--color-status-warning)' }}>
              A canonical identity (companyId, ISIN:&lt;isin&gt;:&lt;series&gt;, exchangeSegment) is required — select a search result.
            </span>
          )}
        </div>
      </form>

      {rangeError !== null && (
        <p
          data-testid="dhan-historical-range-error"
          role="alert"
          style={{ color: 'var(--color-status-negative)', fontSize: 13, marginTop: 12 }}
        >
          {rangeError}
        </p>
      )}

      {loading && <div style={{ marginTop: 16 }}><LoadingState /></div>}

      {!loading && requested && failure !== null && (
        <div style={{ marginTop: 16 }}>
          <p
            data-testid="dhan-historical-failure"
            role="alert"
            style={{ color: 'var(--color-status-negative)', fontSize: 13 }}
          >
            <strong data-testid="dhan-historical-failure-kind">{FAILURE_LABEL[failure.kind]}</strong>: {failure.message}
          </p>
          <button type="button" data-testid="dhan-historical-retry" onClick={() => { void load(); }}>
            Retry
          </button>
        </div>
      )}

      {!loading && requested && failure === null && rangeError === null && result !== null && (() => {
        const hasCandles = result.candles.length > 0;
        const unadjustedCount = result.candles.filter((candle) => !candle.isAdjusted).length;
        const hasUnadjusted = unadjustedCount > 0;
        const allAdjusted = hasCandles && !hasUnadjusted;
        const mixedAdjustment = hasCandles && hasUnadjusted && unadjustedCount < result.candles.length;
        return (
        <div data-testid="dhan-historical-result" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <FreshnessBadge state={result.freshness.toLowerCase() as 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay'} />
            <StatusBadge status="informational" label={`Candles: ${result.returnedCandleCount}`} />
            {hasCandles && (
              hasUnadjusted ? (
                <StatusBadge
                  status="warning"
                  label={mixedAdjustment ? 'Adjustment: Mixed (contains unadjusted)' : 'Unadjusted (corporate actions)'}
                />
              ) : (
                <StatusBadge status="positive" label="Adjusted for corporate actions" />
              )
            )}
          </div>

          <dl
            data-testid="dhan-historical-provenance"
            style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
          >
            <dt style={{ color: 'var(--color-ink-secondary)' }}>Security identity</dt>
            <dd data-testid="dhan-historical-security-id" style={{ margin: 0 }}>
              {result.securityId ?? securityId}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Exchange segment</dt>
            <dd data-testid="dhan-historical-segment-value" style={{ margin: 0 }}>
              {result.exchangeSegment ?? exchangeSegment}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Requested range</dt>
            <dd data-testid="dhan-historical-range" style={{ margin: 0 }}>
              {result.requestedFromDate} → {result.requestedToDate} (inclusive)
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Returned candles</dt>
            <dd data-testid="dhan-historical-count" style={{ margin: 0 }}>{result.returnedCandleCount}</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Coverage claim</dt>
            <dd data-testid="dhan-historical-coverage" style={{ margin: 0 }}>
              {result.coverageClaim ?? 'unavailable'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider qualification</dt>
            <dd data-testid="dhan-historical-qualification" style={{ margin: 0 }}>
              {result.providerQualification ?? 'unavailable'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Corporate-action adjustment</dt>
            <dd data-testid="dhan-historical-adjustment-status" style={{ margin: 0 }}>
              {!hasCandles
                ? 'no candles returned'
                : allAdjusted
                  ? 'Adjusted for corporate actions'
                  : mixedAdjustment
                    ? `Mixed: ${unadjustedCount} of ${result.candles.length} candles unadjusted for corporate actions (splits/bonuses/dividends)`
                    : 'Unadjusted for corporate actions (splits/bonuses/dividends)'}
            </dd>
          </dl>

          {/* The D02 freshness status. IPD reports that no cache or refresh evidence
              exists for this domain, and this panel carries that limitation unchanged
              rather than inferring a freshness verdict from the candles. */}
          <DhanFreshnessPanel
            status={result.freshnessStatus ?? null}
            failure={result.freshnessStatusFailure ?? null}
            heading="Provider freshness (D02_OHLCV)"
          />

          {hasUnadjusted && (
            <div
              role="note"
              data-testid="dhan-historical-unadjusted-disclosure"
              style={{
                marginTop: 12,
                padding: '10px 12px',
                border: '1px solid var(--color-status-warning)',
                borderRadius: 4,
                fontSize: 13,
                background: 'var(--color-surface-1)',
              }}
            >
              <strong>Unadjusted for corporate actions (splits/bonuses/dividends).</strong>{' '}
              Raw unadjusted D02 candles are prohibited from driving split-sensitive valuation or
              portfolio return attribution until corporate-action adjustment is verified and modelled.
            </div>
          )}

          {result.candles.length === 0 ? (
            <div style={{ marginTop: 16 }}>
              <UnavailableState reason="No candles in the requested range" />
              <p data-testid="dhan-historical-empty" style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
                The provider returned zero candles for the requested inclusive range. This is an
                empty result, not a failure.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <DataTable columns={CANDLE_COLUMNS} rows={result.candles} />
            </div>
          )}
        </div>
        );
      })()}

      {!loading && requested && failure === null && rangeError === null && equicoreResult !== null && (
        <div data-testid="equicore-historical-result" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <FreshnessBadge state={equicoreResult.freshness.toLowerCase() as 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay'} />
            <StatusBadge status="informational" label={`Source: ${equicoreResult.source}`} />
            <StatusBadge status="informational" label={`Bars: ${equicoreResult.returnedBarCount} / ${equicoreResult.total}`} />
            <StatusBadge status="warning" label="Unadjusted for corporate actions" />
          </div>

          <dl
            data-testid="equicore-historical-provenance"
            style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
          >
            <dt style={{ color: 'var(--color-ink-secondary)' }}>Historical source</dt>
            <dd data-testid="equicore-historical-source" style={{ margin: 0 }}>{equicoreResult.source}</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Security identity</dt>
            <dd style={{ margin: 0 }}>{equicoreResult.securityId} ({equicoreResult.exchangeSegment})</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Observed symbols</dt>
            <dd style={{ margin: 0 }}>
              {equicoreResult.observedSymbols.length > 0 ? equicoreResult.observedSymbols.join(', ') : 'none'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Requested range</dt>
            <dd style={{ margin: 0 }}>{equicoreResult.requestedFromDate} → {equicoreResult.requestedToDate} (inclusive)</dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Temporal classification</dt>
            <dd data-testid="equicore-historical-temporal" style={{ margin: 0 }}>
              {equicoreResult.temporal.temporalModel} (bitemporalKnowledgeAsOf: {String(equicoreResult.temporal.bitemporalKnowledgeAsOf)})
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Dataset / Baseline manifest</dt>
            <dd data-testid="equicore-historical-manifest" style={{ margin: 0 }}>
              {equicoreResult.provenance.dataset} · {equicoreResult.provenance.baselineManifestSha256 ?? 'unavailable'}
            </dd>

            <dt style={{ color: 'var(--color-ink-secondary)' }}>Response digest (SHA-256)</dt>
            <dd data-testid="equicore-historical-digest" style={{ margin: 0 }}>
              {equicoreResult.integrity.responseDigest} (verified)
            </dd>
          </dl>

          <div
            data-testid="equicore-completeness-panel"
            style={{
              marginTop: 12,
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            <strong>MD-09 Calendar &amp; Completeness ({equicoreResult.completeness.status})</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <StatusBadge
                status="informational"
                label={`Trading days with archive: ${equicoreResult.completeness.tradingDaysWithArchive ?? 'unavailable'}`}
              />
              <StatusBadge
                status="informational"
                label={`Absent trading days: ${equicoreResult.completeness.securityAbsentOnTradingDaysCount ?? 'unavailable'}`}
              />
              <StatusBadge
                status={
                  equicoreResult.completeness.unexplainedCalendarDates &&
                  equicoreResult.completeness.unexplainedCalendarDates.length > 0
                    ? 'warning'
                    : 'positive'
                }
                label={`Unexplained calendar dates: ${
                  equicoreResult.completeness.unexplainedCalendarDates
                    ? equicoreResult.completeness.unexplainedCalendarDates.length
                    : 'unavailable'
                }`}
              />
              <StatusBadge
                status="informational"
                label={`Not-retrieved weekdays: ${
                  equicoreResult.completeness.notRetrievedCalendarDates
                    ? equicoreResult.completeness.notRetrievedCalendarDates.length
                    : 'unavailable'
                }`}
              />
              <StatusBadge
                status="informational"
                label={`Official holidays: ${
                  equicoreResult.completeness.officialHolidayDates
                    ? equicoreResult.completeness.officialHolidayDates.length
                    : 'unavailable'
                }`}
              />
            </div>
          </div>

          <div
            role="note"
            data-testid="equicore-historical-unadjusted-disclosure"
            style={{
              marginTop: 12,
              padding: '10px 12px',
              border: '1px solid var(--color-status-warning)',
              borderRadius: 4,
              fontSize: 13,
              background: 'var(--color-surface-1)',
            }}
          >
            <strong>Unadjusted for corporate actions (RAW_UNADJUSTED).</strong>{' '}
            {equicoreResult.adjustment.unitsProvenanceNote}
          </div>

          {equicoreResult.bars.length === 0 ? (
            <div style={{ marginTop: 16 }}>
              <UnavailableState reason="No EquiCore bars in the requested range" />
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <DataTable columns={EQUICORE_BAR_COLUMNS} rows={equicoreResult.bars} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default DhanHistorical;
