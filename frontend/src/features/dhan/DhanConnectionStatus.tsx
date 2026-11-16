/**
 * DHAN-P2 — DHAN CONNECTION STATUS (synthetic / pre-access phase; W-10 boundary).
 *
 * Route: the DHAN provider status surface. It renders exactly one of five governed
 * connection states and the evidence behind it, and it never claims a capability the server
 * did not prove.
 *
 * THE FIVE STATES
 *   UNAVAILABLE  The DHAN capability could not be assessed. Nothing is claimed.
 *   PRE_ACCESS   IPD reports a provider state that is credential-ready at best (`CONFIGURED`,
 *                `CREDENTIALS_RESOLVED` or `EXPIRED`). This is the expected ceiling of a
 *                correctly installed, credential-free workstation.
 *   DISCONNECTED IPD reports provider state `DEGRADED`: an interaction was attempted and
 *                failed. This is not inferred from an unreadable answer.
 *   AUTHENTICATED IPD reports provider state `AUTHENTICATED`. Earned from vendor-side
 *                evidence recorded by IPD, never assumed.
 *   OPERATIONAL  IPD reports provider state `OPERATIONAL`. Earned from vendor-side evidence
 *                recorded by IPD, never assumed.
 *
 * CONSERVATISM (the surface's core rule)
 *   The component renders the server's state verbatim. It never upgrades a state, never
 *   infers a capability from the absence of a problem, and never presents the provider as
 *   live when IPD's own qualification value says it is not. In this phase the provider's
 *   authoritative qualification is `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`, so `AUTHENTICATED`
 *   and `OPERATIONAL` will not normally appear — the component still renders them
 *   correctly if IPD's evidence ever supplies them.
 *
 * CREDENTIAL SAFETY
 *   The browser receives no bearer token, no client id, no access token and no SecretRef
 *   value. The response carries only IPD's D-7 MAY-list fields: enumerated codes, counts,
 *   booleans, a backend IDENTIFIER and ISO-8601 UTC timestamps. Nothing is stored in the
 *   browser.
 *
 * VERIFY CONNECTION
 *   A distinct, operator-initiated action. It issues EXACTLY ONE read-only request to the
 *   IRR boundary, which in turn issues exactly one diagnostics request to the local IPD
 *   daemon (zero when the transport is not configured). There is no retry, no loop and no
 *   credential re-read, and the action NEVER runs on screen open, on load, on retry or on
 *   any timer. It observes IPD's recorded provider state; it does not itself authenticate
 *   to the vendor.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  fetchDhanHealth,
  verifyDhanConnection,
  DhanHealthApiError,
  type DhanHealthEnvelope,
  type DhanHealthReport,
  type DhanHealthState,
  type DhanVerifyConnectionReport,
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

function yesNo(value: boolean | null): string {
  if (value === null) return 'unknown';
  return value ? 'yes' : 'no';
}

export function DhanConnectionStatus() {
  const [envelope, setEnvelope] = useState<DhanHealthEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);

  const [verifyPhase, setVerifyPhase] = useState<'idle' | 'running' | 'done' | 'failed'>('idle');
  const [verifyResult, setVerifyResult] = useState<DhanVerifyConnectionReport | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

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

  // Operator-initiated only. Nothing in this component may call this on mount, on a timer
  // or in response to rendering — it runs solely from the button below.
  const runVerify = useCallback(async () => {
    setVerifyPhase('running');
    setVerifyError(null);
    try {
      const verifyEnvelope = await verifyDhanConnection();
      setVerifyResult(verifyEnvelope.data);
      setVerifyPhase('done');
    } catch (e: unknown) {
      setVerifyError(failureMessage(e));
      setVerifyPhase('failed');
    }
  }, []);

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
  const verificationProbes = report.requestCounters?.verificationProbes ?? null;
  const vendorRequestsTotal = report.requestCounters?.vendorRequestsTotal ?? null;

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

        <dt style={{ color: 'var(--color-ink-secondary)' }}>IPD provider state</dt>
        <dd data-testid="dhan-health-provider-state" style={{ margin: 0 }}>
          {report.providerState ?? 'UNKNOWN'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Credential readiness</dt>
        <dd data-testid="dhan-health-readiness" style={{ margin: 0 }}>{report.readiness}</dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Credential resolution outcome</dt>
        <dd data-testid="dhan-health-credential-resolution" style={{ margin: 0 }}>
          {report.credentialResolutionOutcome ?? 'none'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Egress mode</dt>
        <dd data-testid="dhan-health-egress-mode" style={{ margin: 0 }}>
          {report.vendorEgressMode ?? 'unknown'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Backend</dt>
        <dd data-testid="dhan-health-backend" style={{ margin: 0 }}>
          {report.vaultBackendId ?? 'unknown'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Configuration resolved</dt>
        <dd data-testid="dhan-health-configuration-resolved" style={{ margin: 0 }}>
          {report.configurationResolved ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>IPD transport reachable</dt>
        <dd data-testid="dhan-health-transport-reachable" style={{ margin: 0 }}>
          {yesNo(report.transportReachable)}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>IPD connection attempted</dt>
        <dd data-testid="dhan-health-connection-attempted" style={{ margin: 0 }}>
          {yesNo(report.connectionAttempted)}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Live provider contacted</dt>
        <dd data-testid="dhan-health-live-contacted" style={{ margin: 0 }}>
          {report.liveProviderContacted ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Live qualified</dt>
        <dd data-testid="dhan-health-live-qualified" style={{ margin: 0 }}>
          {report.liveQualified ? 'yes' : 'no'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Live connectivity (IPD)</dt>
        <dd data-testid="dhan-health-connectivity" style={{ margin: 0 }}>
          {report.liveProviderConnectivity}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Provider qualification (IPD)</dt>
        <dd data-testid="dhan-health-qualification" style={{ margin: 0 }}>
          {report.providerQualification}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Last success (IPD)</dt>
        <dd data-testid="dhan-health-last-success" style={{ margin: 0 }}>
          {report.lastSuccessAt ?? 'none'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Last failure category (IPD)</dt>
        <dd data-testid="dhan-health-last-failure-category" style={{ margin: 0 }}>
          {report.lastFailureCategory ?? 'none'}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Last latency (IPD)</dt>
        <dd data-testid="dhan-health-last-latency" style={{ margin: 0 }}>
          {report.lastLatencyMs === null ? 'none' : `${report.lastLatencyMs} ms`}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Auth latched (IPD)</dt>
        <dd data-testid="dhan-health-auth-latched" style={{ margin: 0 }}>
          {yesNo(report.authLatched)}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Verification probes (IPD)</dt>
        <dd data-testid="dhan-health-verification-probes" style={{ margin: 0 }}>
          {verificationProbes === null ? 'unknown' : verificationProbes}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Vendor requests (IPD)</dt>
        <dd data-testid="dhan-health-vendor-requests" style={{ margin: 0 }}>
          {vendorRequestsTotal === null ? 'unknown' : vendorRequestsTotal}
        </dd>

        <dt style={{ color: 'var(--color-ink-secondary)' }}>Qualified mappings loaded (IPD)</dt>
        <dd data-testid="dhan-health-mappings" style={{ margin: 0 }}>
          {report.qualifiedMappingsLoaded === null ? 'unknown' : report.qualifiedMappingsLoaded}
        </dd>
      </dl>

      <div data-testid="dhan-verify-connection-section" style={{ marginTop: 20 }}>
        <button
          type="button"
          data-testid="dhan-verify-connection"
          disabled={verifyPhase === 'running'}
          onClick={() => { void runVerify(); }}
        >
          {verifyPhase === 'running' ? 'Verifying…' : 'Verify connection'}
        </button>
        <p style={{ color: 'var(--color-ink-secondary)', fontSize: 12, margin: '4px 0 0' }}>
          Operator-initiated. Issues exactly one read-only diagnostics request to the local
          IPD daemon; nothing is retried, and this never runs automatically.
        </p>

        {verifyPhase === 'failed' && (
          <p
            data-testid="dhan-verify-failure"
            role="alert"
            style={{ color: 'var(--color-status-negative)', fontSize: 13, marginTop: 8 }}
          >
            {verifyError ?? 'verification failed'}
          </p>
        )}

        {verifyPhase === 'done' && verifyResult && (
          <div
            data-testid="dhan-verify-result"
            style={{ marginTop: 12, fontSize: 13, border: '1px solid var(--color-border, #ccc)', borderRadius: 6, padding: 12 }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>
              Verification outcome: {verifyResult.outcome}
            </p>
            <p style={{ margin: '4px 0 0' }}>Checked at {verifyResult.checkedAt} · requests issued to IPD: {verifyResult.requestsIssued}</p>
            <p style={{ margin: '4px 0 0' }}>IPD provider state: {verifyResult.providerState ?? 'UNKNOWN'}</p>
            <p style={{ margin: '4px 0 0' }}>
              Credential resolution: {verifyResult.credentialResolutionOutcome ?? 'none'} · last auth outcome: {verifyResult.lastAuthOutcome ?? 'none'}
            </p>
            <p style={{ margin: '4px 0 0' }}>
              Verification probes recorded by IPD: {verifyResult.requestCounters?.verificationProbes ?? 'unknown'}
            </p>
            <p style={{ margin: '4px 0 0' }}>
              Live provider contacted by this action: {verifyResult.liveProviderContacted ? 'yes' : 'no'}
            </p>
            <p data-testid="dhan-verify-note" style={{ margin: '8px 0 0', color: 'var(--color-ink-secondary)', fontSize: 12 }}>
              {verifyResult.verificationNote}
            </p>
          </div>
        )}
      </div>

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
