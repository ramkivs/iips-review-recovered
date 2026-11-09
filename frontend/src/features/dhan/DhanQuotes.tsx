/**
 * DHAN-P3 — DHAN QUOTES (read-only market quotes over the IPD market-data transport).
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
 * THE IDENTITY RULE
 *   A quote requires an exact canonical D114 identity (`ISIN:<isin>:<series>`). When the
 *   identity is missing or invalid, the server answers with an IDENTITY failure and this
 *   surface says so explicitly — it does NOT present an "unavailable market data" message
 *   for what is really an identity problem.
 */
import { useCallback, useState } from 'react';
import {
  fetchDhanQuote,
  DhanMarketDataApiError,
  type DhanQuoteDto,
  type DhanMarketDataFailureKind,
} from '../../api/dhanMarketData';
import { MetricCard, MetricGroup } from '../../components/data/DataComponents';
import { FreshnessBadge, StatusBadge } from '../../components/ui/Badges';
import { LoadingState, UnavailableState } from '../../components/state/StateComponents';
import { DhanFreshnessPanel } from './DhanFreshnessStatus';

/** The canonical identity grammar, mirrored for the client-side input affordance only. */
const D114_SECURITY_ID_PATTERN = /^ISIN:[A-Za-z0-9]{12}:[^:\s]+$/;

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
function num(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Renders an ISO timestamp for display, or 'unavailable' when absent. */
function stamp(value: string | null): string {
  return value === null || value === '' ? 'unavailable' : value;
}

export function DhanQuotes() {
  const [companyId, setCompanyId] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [exchangeSegment, setExchangeSegment] = useState<'NSE_EQ' | 'BSE_EQ' | ''>('');
  const [quote, setQuote] = useState<DhanQuoteDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<{ kind: DhanMarketDataFailureKind; message: string } | null>(null);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailure(null);
    try {
      const result = await fetchDhanQuote({
        companyId: companyId.trim(),
        securityId: securityId.trim(),
        ...(exchangeSegment === '' ? {} : { exchangeSegment }),
      });
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

  const identityLooksValid = D114_SECURITY_ID_PATTERN.test(securityId.trim()) && companyId.trim() !== '';

  return (
    <section data-testid="dhan-quotes-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Quotes</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        Quotes are read from the IPD market-data service, which remains the market-data
        authority. The browser sends a canonical request only; it never computes a price and
        never holds a credential.
      </p>

      <form
        data-testid="dhan-quote-form"
        style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 560 }}
        onSubmit={(e) => { e.preventDefault(); void load(); }}
      >
        <label htmlFor="dhan-quote-company" style={{ fontSize: 13 }}>Company id</label>
        <input
          id="dhan-quote-company"
          data-testid="dhan-quote-company"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        />

        <label htmlFor="dhan-quote-security" style={{ fontSize: 13 }}>
          Security identity (ISIN:&lt;isin&gt;:&lt;series&gt;)
        </label>
        <input
          id="dhan-quote-security"
          data-testid="dhan-quote-security"
          value={securityId}
          onChange={(e) => setSecurityId(e.target.value)}
          placeholder="ISIN:INE002A01018:EQ"
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        />

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
            disabled={loading}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            {loading ? 'Loading…' : 'Get quote'}
          </button>
          {!identityLooksValid && companyId.trim() !== '' && (
            <span data-testid="dhan-quote-identity-hint" style={{ fontSize: 12, color: 'var(--color-status-warning)' }}>
              A canonical identity (ISIN:&lt;isin&gt;:&lt;series&gt;) is required.
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
              The provider did not return usable market data. No value below is a price.
            </p>
          )}

          <MetricGroup label="Quote">
            <MetricCard label="Last traded" value={num(quote.quote?.ltp)} unit={quote.quote?.currency} />
            <MetricCard label="Open" value={num(quote.quote?.open)} />
            <MetricCard label="High" value={num(quote.quote?.high)} />
            <MetricCard label="Low" value={num(quote.quote?.low)} />
            <MetricCard label="Previous close" value={num(quote.quote?.previousClose)} />
            <MetricCard label="Volume" value={num(quote.quote?.volume)} />
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
