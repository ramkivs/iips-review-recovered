/**
 * DHAN-P2 — DHAN CONNECTION STATUS (synthetic / pre-access phase).
 *
 * Route: the DHAN provider status surface. It renders exactly one of five governed
 * connection states and the evidence behind it, and it never claims a capability the server
 * did not prove.
 *
 * THE FIVE STATES
 *   UNAVAILABLE  The DHAN capability could not be assessed. Nothing is claimed.
 *   PRE_ACCESS   Credential references are not configured; the provider is in its governed
 *                pre-access mode. This is the expected state of a correctly installed,
 *                credential-free workstation.
 *   DISCONNECTED The provider side is configured, but the local IPD market-data transport did
 *                not answer.
 *   AUTHENTICATED Credentials were accepted by the vendor. Earned, never assumed.
 *   OPERATIONAL  Live connectivity and live qualification are both established. Earned,
 *                never assumed.
 *
 * CONSERVATISM (the surface's core rule)
 *   The component renders the server's state verbatim. It never upgrades a state, never infers
 *   a capability from the absence of a problem, and never presents the provider as live when
 *   the provider's own qualification value says it is not. In this phase the provider's
 *   authoritative qualification is `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`, so `AUTHENTICATED` and
 *   `OPERATIONAL` are unreachable — the component still renders them correctly if a future
 *   authoritative signal ever supplies them.
 *
 * CREDENTIAL SAFETY
 *   The browser receives no bearer token, no client id, no access token and no SecretRef value.
 *   The only credential-adjacent information rendered is the SecretRef POINTER (key path) and
 *   the names of absent configuration keys. Nothing is stored in the browser.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  fetchDhanHealth,
  DhanHealthApiError,
  type DhanHealthEnvelope,
  type DhanHealthReport,
  type DhanHealthState,
} from '../../api/dhanHealth';
import { LoadingState } from '../../components/state/StateComponents';
import { StatusBadge } from '../../components/ui/Badges';

/**
 * Presentation for each state. The label and the symbol are what a non-colour-only reader
 * relies on; the colour is reinforcement, never the carrier of the meaning.
 */
const STATE_PRESENTATION: Record<
  DhanHealthState,
  { label: string; symbol: string; status: 'positive' | 'negative' | 'neutral' | 'warning' | 'informational' }
> = {
  UNAVAILABLE: { label: 'UNAVAILABLE', symbol: '✕', status: 'negative' },
  PRE_ACCESS: { label: 'PRE-ACCESS', symbol: '○', status: 'informational' },
  DISCONNECTED: { label: 'DISCONNECTED', symbol: '▲', status: 'warning' },
  AUTHENTICATED: { label: 'AUTHENTICATED', symbol: '◐', status: 'positive' },
  OPERATIONAL: { label: 'OPERATIONAL', symbol: '●', status: 'positive' },
};

function failureMessage(e: unknown): string {
  if (e instanceof DhanHealthApiError) return e.message;
  return `dhan health unavailable: ${String(e)}`;
}

export function DhanConnectionStatus() {
  const [envelope, setEnvelope] = useState<DhanHealthEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);

  const load = useCallback(async () => {
    setFailure(null);
    try {
      setEnvelope(await fetchDhanHealth());
    } catch (e: unknown) {
      // A failed request is reported plainly. The surface never substitutes a fabricated or
      // optimistic state for an unassessed one.
      setFailure(failureMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState />;

  if (envelope === null) {
    return (
      <section data-testid="dhan-health-surface">
        <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Connection Status</h1>
        <p
          data-testid="dhan-health-failure"
          role="alert"
          style={{ color: 'var(--color-status-negative)', fontSize: 13, marginTop: 12 }}
        >
          {failure ?? 'dhan health unavailable'}
        </p>
        <button type="button" data-testid="dhan-health-retry" onClick={() => { setLoading(true); void load(); }}>
          Retry
        </button>
      </section>
    );
  }

  const report: DhanHealthReport = envelope.data;
  const presentation = STATE_PRESENTATION[report.state];

  return (
    <section data-testid="dhan-health-surface">
      <h1 style={{ fontSize: 22, margin: 0 }}>DHAN Connection Status</h1>

      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 13, margin: '6px 0 0' }}>
        {report.disclosure}
      </p>

      <div
        data-testid="dhan-health-state"
        style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
      >
        <StatusBadge status={presentation.status} label={presentation.label} />
        <span
          aria-hidden="true"
          style={{ fontSize: 16, color: 'var(--color-ink-secondary)' }}
        >
          {presentation.symbol}
        </span>
        <span data-testid="dhan-health-summary" style={{ fontSize: 13 }}>
          {report.summary}
        </span>
      </div>

      <dl
        data-testid="dhan-health-facts"
        style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: 13 }}
      >
        <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider</dt>
        <dd data-testid="dhan-health-provider-id" style={{ margin: 0 }}>{report.providerId}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Credential readiness</dt>
        <dd data-testid="dhan-health-readiness" style={{ margin: 0 }}>{report.readiness}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Configuration resolved</dt>
        <dd data-testid="dhan-health-configuration-resolved" style={{ margin: 0 }}>
          {report.configurationResolved ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>IPD transport reachable</dt>
        <dd data-testid="dhan-health-transport-reachable" style={{ margin: 0 }}>
          {report.transportReachable ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Live provider contacted</dt>
        <dd data-testid="dhan-health-live-contacted" style={{ margin: 0 }}>
          {report.liveProviderContacted ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Live qualified</dt>
        <dd data-testid="dhan-health-live-qualified" style={{ margin: 0 }}>
          {report.liveQualified ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Failure code</dt>
        <dd data-testid="dhan-health-failure-code" style={{ margin: 0 }}>
          {report.failureCode ?? 'none'}
        </dd>
      </dl>

      {report.secretRefPointers.length > 0 && (
        <div data-testid="dhan-health-secret-pointers" style={{ marginTop: 16 }}>
          <strong style={{ fontSize: 13 }}>Configured secret references (pointers only)</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 13 }}>
            {report.secretRefPointers.map((pointer) => (
              <li key={pointer} data-testid="dhan-health-secret-pointer">{pointer}</li>
            ))}
          </ul>
        </div>
      )}

      {report.missingKeys.length > 0 && (
        <div data-testid="dhan-health-missing-keys" style={{ marginTop: 16 }}>
          <strong style={{ fontSize: 13 }}>Absent configuration keys (names only)</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 13 }}>
            {report.missingKeys.map((key) => (
              <li key={key} data-testid="dhan-health-missing-key">{key}</li>
            ))}
          </ul>
        </div>
      )}

      <div data-testid="dhan-health-reasons" style={{ marginTop: 16 }}>
        <strong style={{ fontSize: 13 }}>Evidence</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: 13 }}>
          {report.reasons.map((reason) => (
            <li key={reason} data-testid="dhan-health-reason">{reason}</li>
          ))}
        </ul>
      </div>

      <p
        data-testid="dhan-health-provenance"
        style={{ color: 'var(--color-ink-secondary)', fontSize: 12, marginTop: 20 }}
      >
        {envelope.provenance.dataSource} · {envelope.provenance.dataVersion}
        <br />
        {envelope.provenance.transportSemantics}
      </p>
    </section>
  );
}

export default DhanConnectionStatus;
