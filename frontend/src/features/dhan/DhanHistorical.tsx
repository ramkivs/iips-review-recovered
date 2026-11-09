/**
 * DHAN-P3 — DHAN HISTORICAL DATA (read-only OHLCV over the IPD market-data transport).
 *
 * IPD remains the market-data authority: IPD resolves the instrument, normalizes the vendor
 * payload into canonical candles and reports its own coverage claim. This component is the
 * PRESENTATION layer — it renders exactly the candles IPD returned and computes no
 * indicator, average, return or derived series of its own.
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
import { DataTable, type Column } from '../../components/data/DataComponents';
import { FreshnessBadge, StatusBadge } from '../../components/ui/Badges';
import { LoadingState, UnavailableState } from '../../components/state/StateComponents';
import { DhanFreshnessPanel } from './DhanFreshnessStatus';

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
  return { kind: 'transport', message: String(e) };
}

/**
 * Validates the requested range with IPD's inclusive semantics and maximum window.
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
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return 'Both dates must be parseable calendar dates.';
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

export function DhanHistorical() {
  const [companyId, setCompanyId] = useState('');
  const [isin, setIsin] = useState('');
  const [exchangeSegment, setExchangeSegment] = useState<'NSE_EQ' | 'BSE_EQ' | ''>('');
  const [interval, setInterval] = useState<Interval>('1D');
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-31');
  const [result, setResult] = useState<DhanHistoricalDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<{ kind: DhanMarketDataFailureKind; message: string } | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    const rangeProblem = validateHistoricalRange(fromDate.trim(), toDate.trim());
    setRangeError(rangeProblem);
    if (rangeProblem !== null) {
      // An invalid range never leaves the browser.
      setResult(null);
      setFailure(null);
      setRequested(true);
      return;
    }

    setLoading(true);
    setFailure(null);
    try {
      const data = await fetchDhanHistorical({
        companyId: companyId.trim(),
        interval,
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
        ...(exchangeSegment === '' ? {} : { exchangeSegment }),
        ...(isin.trim() === '' ? {} : { isin: isin.trim() }),
      });
      setResult(data);
    } catch (e: unknown) {
      setResult(null);
      setFailure(failureOf(e));
    } finally {
      setLoading(false);
      setRequested(true);
    }
  }, [companyId, isin, exchangeSegment, interval, fromDate, toDate]);

  return (
    <section data-testid="dhan-historical-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Historical Data</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Historical OHLCV is read from the IPD market-data service, which normalizes the
        provider payload into canonical candles. The date range is inclusive on both ends and
        spans at most {MAX_WINDOW_DAYS} days.
      </p>

      <form
        data-testid="dhan-historical-form"
        style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 560 }}
        onSubmit={(e) => { e.preventDefault(); void load(); }}
      >
        <label htmlFor="dhan-historical-company" style={{ fontSize: 13 }}>Company id</label>
        <input
          id="dhan-historical-company"
          data-testid="dhan-historical-company"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        />

        <label htmlFor="dhan-historical-isin" style={{ fontSize: 13 }}>ISIN (optional)</label>
        <input
          id="dhan-historical-isin"
          data-testid="dhan-historical-isin"
          value={isin}
          onChange={(e) => setIsin(e.target.value)}
          placeholder="INE002A01018"
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        />

        <label htmlFor="dhan-historical-segment" style={{ fontSize: 13 }}>Exchange segment</label>
        <select
          id="dhan-historical-segment"
          data-testid="dhan-historical-segment"
          value={exchangeSegment}
          onChange={(e) => setExchangeSegment(e.target.value as 'NSE_EQ' | 'BSE_EQ' | '')}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        >
          <option value="">(default)</option>
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
            disabled={loading}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            {loading ? 'Loading…' : 'Get history'}
          </button>
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

      {!loading && requested && failure === null && rangeError === null && result !== null && (
        <div data-testid="dhan-historical-result" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <FreshnessBadge state={result.freshness.toLowerCase() as 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay'} />
            <StatusBadge status="informational" label={`Candles: ${result.returnedCandleCount}`} />
          </div>

          <dl
            data-testid="dhan-historical-provenance"
            style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
          >
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
          </dl>

          {/* The D02 freshness status. IPD reports that no cache or refresh evidence
              exists for this domain, and this panel carries that limitation unchanged
              rather than inferring a freshness verdict from the candles. */}
          <DhanFreshnessPanel
            status={result.freshnessStatus ?? null}
            failure={result.freshnessStatusFailure ?? null}
            heading="Provider freshness (D02_OHLCV)"
          />

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
      )}
    </section>
  );
}

export default DhanHistorical;
