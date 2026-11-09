/**
 * DHAN-P5 — DHAN FRESHNESS / STATUS (read-only provider-side freshness evidence).
 *
 * IPD remains the freshness authority. This component asks the IRR server for IPD's own
 * `GET /v1/freshness` status and renders it verbatim: the domain, the cache state, the
 * provider observation timestamp, the receipt and evaluation timestamps, the verdict and
 * its threshold, the stale-concession and suppression decisions, the last refresh outcome
 * and its sanitized failure detail.
 *
 * WHAT THIS SURFACE NEVER DOES
 *   - It never computes a verdict, an age or a threshold. IPD owns the evaluation.
 *   - It never shows `LIVE`. IPD's `GOOD` maps to IRR `SNAPSHOT`; a fresh observation is
 *     not a live provider.
 *   - It never treats missing evidence as good evidence. An unknown or unreadable status is
 *     displayed as exactly that.
 *   - It never invents a historical freshness verdict. For D02, IPD reports that no cache
 *     or refresh evidence exists, and this surface says so in words.
 */
import { useCallback, useState } from 'react';
import {
  fetchDhanFreshness,
  DhanMarketDataApiError,
  type DhanFreshnessStatusDto,
} from '../../api/dhanMarketData';
import { FreshnessBadge, StatusBadge } from '../../components/ui/Badges';
import { LoadingState, UnavailableState } from '../../components/state/StateComponents';

/** The domains IPD governs. */
const DOMAINS = [
  { id: 'D01_QUOTES' as const, label: 'D01 — Quotes' },
  { id: 'D02_OHLCV' as const, label: 'D02 — OHLCV (historical)' },
];

/** Renders a timestamp, or an explicit unavailable marker. */
function stamp(value: string | null | undefined): string {
  return value === null || value === undefined || value === '' ? 'unavailable' : value;
}

/** Renders a duration in seconds in a human-readable, exact form. */
function seconds(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'unavailable';
  return `${value} s`;
}

/**
 * The freshness status panel.
 *
 * It is used both as a standalone surface and as an embedded panel inside the quote and
 * historical views, so the same evidence is presented identically wherever it appears.
 */
export function DhanFreshnessPanel({
  status,
  failure,
  heading,
}: {
  status: DhanFreshnessStatusDto | null;
  failure: { readonly code: string; readonly message: string } | null;
  heading?: string;
}) {
  if (failure !== null) {
    return (
      <div data-testid="dhan-freshness-panel" style={{ marginTop: 16 }}>
        <p
          data-testid="dhan-freshness-failure"
          role="alert"
          style={{ color: 'var(--color-status-negative)', fontSize: 13 }}
        >
          <strong data-testid="dhan-freshness-failure-code">{failure.code}</strong>: {failure.message}
        </p>
        <p data-testid="dhan-freshness-unknown-notice" style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          The freshness evidence is unknown. This is not a statement that the data is current.
        </p>
      </div>
    );
  }

  if (status === null) {
    return (
      <div data-testid="dhan-freshness-panel" style={{ marginTop: 16 }}>
        <p data-testid="dhan-freshness-unknown-notice" style={{ fontSize: 13, color: 'var(--color-ink-secondary)' }}>
          The freshness evidence is unknown. This is not a statement that the data is current.
        </p>
      </div>
    );
  }

  const d02Limitation = !status.evidenceAvailable;

  return (
    <div data-testid="dhan-freshness-panel" style={{ marginTop: 16 }}>
      {heading !== undefined && (
        <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ink-secondary)', margin: '0 0 8px' }}>
          {heading}
        </h4>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <FreshnessBadge state={status.freshness.toLowerCase() as 'live' | 'snapshot' | 'stale' | 'unavailable' | 'replay'} />
        <StatusBadge status="informational" label={`Domain: ${status.domain}`} />
        <StatusBadge
          status={status.cacheState === 'CURRENT' ? 'positive' : status.cacheState === 'STALE' ? 'warning' : 'negative'}
          label={`Cache: ${status.cacheState}`}
        />
      </div>

      {d02Limitation && (
        <p
          data-testid="dhan-freshness-d02-limitation"
          style={{ color: 'var(--color-status-warning)', fontSize: 13 }}
        >
          No cache or refresh evidence is available for this domain. The provider-side
          service does not wire the observation cache or the refresh orchestrator for it, so
          this status is reported unchanged rather than inferred.
        </p>
      )}

      {status.verdict === 'UNKNOWN' && !d02Limitation && (
        <p data-testid="dhan-freshness-unknown-verdict" style={{ color: 'var(--color-status-warning)', fontSize: 13 }}>
          The provider's verdict is UNKNOWN: there is no usable freshness evidence for this
          scope.
        </p>
      )}

      {status.suppressExecution && (
        <p data-testid="dhan-freshness-suppressed" style={{ color: 'var(--color-status-negative)', fontSize: 13 }}>
          The provider suppresses this observation from execution.
        </p>
      )}

      {status.staleConcessionActive && (
        <p data-testid="dhan-freshness-concession" style={{ color: 'var(--color-status-warning)', fontSize: 13 }}>
          A stale concession is active: the observation is past its threshold but remains
          usable.
        </p>
      )}

      <dl
        data-testid="dhan-freshness-details"
        style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
      >
        <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider verdict</dt>
        <dd data-testid="dhan-freshness-verdict" style={{ margin: 0 }}>{status.verdict}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider observation (asOf)</dt>
        <dd data-testid="dhan-freshness-as-of" style={{ margin: 0 }}>{stamp(status.asOf)}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Received at</dt>
        <dd data-testid="dhan-freshness-received-at" style={{ margin: 0 }}>{stamp(status.receivedAt)}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Evaluated at (this read)</dt>
        <dd data-testid="dhan-freshness-evaluated-at" style={{ margin: 0 }}>{stamp(status.evaluatedAt)}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Observation evaluated at</dt>
        <dd data-testid="dhan-freshness-observation-evaluated-at" style={{ margin: 0 }}>
          {stamp(status.observationEvaluatedAt)}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Timestamp evidence</dt>
        <dd data-testid="dhan-freshness-timestamp-evidence" style={{ margin: 0 }}>
          {status.timestampEvidence}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Threshold</dt>
        <dd data-testid="dhan-freshness-threshold" style={{ margin: 0 }}>{seconds(status.thresholdSeconds)}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Age</dt>
        <dd data-testid="dhan-freshness-age" style={{ margin: 0 }}>{seconds(status.ageSeconds)}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Stale concession</dt>
        <dd data-testid="dhan-freshness-stale-concession" style={{ margin: 0 }}>
          {status.staleConcessionActive ? 'active' : 'not active'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Execution suppression</dt>
        <dd data-testid="dhan-freshness-suppress-execution" style={{ margin: 0 }}>
          {status.suppressExecution ? 'suppressed' : 'not suppressed'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Eligible for use</dt>
        <dd data-testid="dhan-freshness-eligible" style={{ margin: 0 }}>
          {status.eligibleForUse ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Last refresh outcome</dt>
        <dd data-testid="dhan-freshness-last-refresh" style={{ margin: 0 }}>{status.lastRefresh.outcome}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Last refresh failure</dt>
        <dd data-testid="dhan-freshness-last-failure" style={{ margin: 0 }}>
          {status.lastRefresh.lastFailure === null
            ? 'none'
            : `${status.lastRefresh.lastFailure.code} (prior observation ${
                status.lastRefresh.lastFailure.priorPreserved ? 'preserved' : 'not preserved'
              })`}
        </dd>
      </dl>

      <p data-testid="dhan-freshness-explanation" style={{ marginTop: 12, fontSize: 13, color: 'var(--color-ink-secondary)' }}>
        {status.explanation}
      </p>
    </div>
  );
}

/**
 * The standalone freshness/status surface.
 *
 * It reads the status for a chosen domain and scope. The D01 scope requires an exact
 * canonical identity, because IPD's D01 lookup has no identity fallback: it inspects one
 * exact quote-cache key and never guesses.
 */
export function DhanFreshnessStatus() {
  const [domain, setDomain] = useState<'D01_QUOTES' | 'D02_OHLCV'>('D01_QUOTES');
  const [companyId, setCompanyId] = useState('');
  const [exchangeSegment, setExchangeSegment] = useState<'NSE_EQ' | 'BSE_EQ'>('NSE_EQ');
  const [securityId, setSecurityId] = useState('');
  const [status, setStatus] = useState<DhanFreshnessStatusDto | null>(null);
  const [failure, setFailure] = useState<{ code: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailure(null);
    try {
      const result = await fetchDhanFreshness({
        domain,
        ...(domain === 'D01_QUOTES'
          ? { companyId: companyId.trim(), exchangeSegment, securityId: securityId.trim() }
          : {}),
      });
      setStatus(result);
    } catch (e: unknown) {
      setStatus(null);
      setFailure(
        e instanceof DhanMarketDataApiError
          ? { code: e.detail?.code ?? e.kind, message: e.message }
          : { code: 'TRANSPORT_FAILURE', message: String(e) },
      );
    } finally {
      setLoading(false);
      setRequested(true);
    }
  }, [domain, companyId, exchangeSegment, securityId]);

  return (
    <section data-testid="dhan-freshness-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Freshness &amp; Status</h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        The provider-side freshness verdict, cache state, threshold, stale-concession and
        suppression decisions and last refresh outcome come from IPD. Reading this status
        never triggers a refresh, never calls the provider and never mutates any cache.
      </p>

      <form
        data-testid="dhan-freshness-form"
        style={{ marginTop: 16, display: 'grid', gap: 8, maxWidth: 560 }}
        onSubmit={(e) => { e.preventDefault(); void load(); }}
      >
        <label htmlFor="dhan-freshness-domain" style={{ fontSize: 13 }}>Domain</label>
        <select
          id="dhan-freshness-domain"
          data-testid="dhan-freshness-domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value as 'D01_QUOTES' | 'D02_OHLCV')}
          style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
        >
          {DOMAINS.map((entry) => (
            <option key={entry.id} value={entry.id}>{entry.label}</option>
          ))}
        </select>

        {domain === 'D01_QUOTES' && (
          <>
            <label htmlFor="dhan-freshness-company" style={{ fontSize: 13 }}>Company id</label>
            <input
              id="dhan-freshness-company"
              data-testid="dhan-freshness-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
            />

            <label htmlFor="dhan-freshness-segment" style={{ fontSize: 13 }}>Exchange segment</label>
            <select
              id="dhan-freshness-segment"
              data-testid="dhan-freshness-segment"
              value={exchangeSegment}
              onChange={(e) => setExchangeSegment(e.target.value as 'NSE_EQ' | 'BSE_EQ')}
              style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
            >
              <option value="NSE_EQ">NSE_EQ</option>
              <option value="BSE_EQ">BSE_EQ</option>
            </select>

            <label htmlFor="dhan-freshness-security" style={{ fontSize: 13 }}>
              Security identity (ISIN:&lt;isin&gt;:&lt;series&gt;)
            </label>
            <input
              id="dhan-freshness-security"
              data-testid="dhan-freshness-security"
              value={securityId}
              onChange={(e) => setSecurityId(e.target.value)}
              placeholder="ISIN:INE002A01018:EQ"
              style={{ padding: 6, border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13 }}
            />
          </>
        )}

        <div style={{ marginTop: 4 }}>
          <button type="submit" data-testid="dhan-freshness-submit" disabled={loading} style={{ padding: '6px 12px', fontSize: 13 }}>
            {loading ? 'Loading…' : 'Read freshness status'}
          </button>
        </div>
      </form>

      {loading && <div style={{ marginTop: 16 }}><LoadingState /></div>}

      {!loading && requested && failure === null && status === null && (
        <div style={{ marginTop: 16 }}>
          <UnavailableState reason="No freshness status" />
        </div>
      )}

      {!loading && (
        <DhanFreshnessPanel status={status} failure={failure} />
      )}
    </section>
  );
}

export default DhanFreshnessStatus;
