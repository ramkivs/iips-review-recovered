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
 *   A distinct, operator-initiated action. It issues EXACTLY ONE request to the IRR
 *   boundary, which in turn issues exactly one call to IPD's governed
 *   `POST /v1/connection/verify` operation (zero when the transport is not configured).
 *   IPD performs its own fail-closed verification — in LIVE_PROBE mode at most one
 *   authenticated vendor probe — and returns the D-7 §3 verification contract, which the
 *   IRR boundary and this client both check fail-closed. There is no retry, no loop and no
 *   credential re-read by IRR, and the action NEVER runs on screen open, on load, on retry
 *   or on any timer. Local readiness (`VERIFIED_LOCAL_ONLY`) and vendor authentication
 *   (`VERIFIED_VENDOR_ACCEPTED`) are rendered as DISTINCT outcomes; `VERIFIED_LOCAL_ONLY`
 *   is never shown as authentication or live connectivity.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  fetchDhanHealth,
  verifyDhanConnection,
  DhanHealthApiError,
  type DhanHealthEnvelope,
  type DhanHealthReport,
  type DhanHealthState,
  type DhanVerificationOutcomeCode,
  type DhanVerifyConnectionOutcome,
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

/**
 * Presentation for the D-7 §3 verification verdicts. `VERIFIED_LOCAL_ONLY` gets a distinct,
 * non-positive treatment: local readiness is NOT vendor authentication and is never rendered
 * as such.
 */
const VERIFICATION_PRESENTATION: Record<
  DhanVerificationOutcomeCode,
  { label: string; status: 'positive' | 'negative' | 'neutral' | 'warning' | 'informational' }
> = {
  VERIFIED_VENDOR_ACCEPTED: { label: 'VENDOR AUTHENTICATED', status: 'positive' },
  VERIFIED_LOCAL_ONLY: { label: 'LOCAL READINESS ONLY', status: 'informational' },
  AUTH_REJECTED: { label: 'AUTH REJECTED', status: 'negative' },
  EXPIRED_LOCAL: { label: 'CREDENTIAL EXPIRED', status: 'warning' },
  NOT_ATTEMPTED_NOT_READY: { label: 'NOT ATTEMPTED', status: 'neutral' },
  FAILED_TRANSPORT: { label: 'PROBE FAILED · TRANSPORT', status: 'negative' },
  FAILED_VENDOR_RESPONSE: { label: 'PROBE FAILED · VENDOR', status: 'negative' },
};

const VERIFICATION_DISPOSITION_PRESENTATION: Record<
  DhanVerifyConnectionOutcome,
  { label: string; status: 'positive' | 'negative' | 'neutral' | 'warning' | 'informational' }
> = {
  EXECUTED: { label: 'EXECUTED', status: 'informational' },
  NOT_ATTEMPTED_NOT_CONFIGURED: { label: 'NOT ATTEMPTED', status: 'neutral' },
  TRANSPORT_UNAVAILABLE: { label: 'NOT VERIFIED · DAEMON UNREACHABLE', status: 'negative' },
  VERIFICATION_CONTRACT_VIOLATION: { label: 'NOT VERIFIED · CONTRACT VIOLATION', status: 'negative' },
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
          Operator-initiated. Issues exactly one connection-verification request to the local
          IPD daemon (IPD may perform at most one authenticated vendor probe); nothing is
          retried, and this never runs automatically. Local readiness is not vendor
          authentication.
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

        {verifyPhase === 'done' && verifyResult && (() => {
          const verification = verifyResult.verification;
          const disposition = VERIFICATION_DISPOSITION_PRESENTATION[verifyResult.outcome];
          const presented = verification ? VERIFICATION_PRESENTATION[verification.outcome] : null;
          return (
            <div
              data-testid="dhan-verify-result"
              style={{ marginTop: 12, fontSize: 13, border: '1px solid var(--color-border, #ccc)', borderRadius: 6, padding: 12 }}
            >
              <div
                data-testid="dhan-verify-disposition"
                style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
              >
                <StatusBadge status={disposition.status} label={disposition.label} />
              </div>
              {presented && verification ? (
                <>
                  <div
                    data-testid="dhan-verify-verdict"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}
                  >
                    <StatusBadge status={presented.status} label={presented.label} />
                    <span data-testid="dhan-verify-outcome-code" style={{ fontSize: 12, color: 'var(--color-ink-secondary)' }}>
                      {verification.outcome}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0' }}>
                    {verification.outcome === 'VERIFIED_LOCAL_ONLY'
                      ? 'Local credential readiness was established. The vendor was NOT contacted — this is NOT vendor authentication and NOT live connectivity.'
                      : verification.outcome === 'VERIFIED_VENDOR_ACCEPTED'
                        ? 'The vendor accepted authentication for this connection. Exactly one authenticated vendor probe was issued by IPD.'
                        : 'The vendor did not authenticate this connection. No capability beyond the reported outcome is claimed.'}
                  </p>
                  <dl style={{ margin: '8px 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 12px' }}>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>Verification mode</dt>
                    <dd data-testid="dhan-verify-mode" style={{ margin: 0 }}>{verification.mode}</dd>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>IPD provider state</dt>
                    <dd data-testid="dhan-verify-provider-state" style={{ margin: 0 }}>{verification.providerState}</dd>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>Local readiness established</dt>
                    <dd data-testid="dhan-verify-local-readiness" style={{ margin: 0 }}>
                      {verification.localReadinessEstablished ? 'yes' : 'no'}
                    </dd>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>Vendor probe attempted</dt>
                    <dd data-testid="dhan-verify-probe-attempted" style={{ margin: 0 }}>
                      {verification.probeAttempted ? 'yes' : 'no'} ({verification.probeCount})
                    </dd>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>Failure category</dt>
                    <dd data-testid="dhan-verify-failure-category" style={{ margin: 0 }}>
                      {verification.failureCategory ?? 'none'}
                    </dd>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>Verification checked at (IPD)</dt>
                    <dd data-testid="dhan-verify-checked-at" style={{ margin: 0 }}>{verification.checkedAt}</dd>
                    <dt style={{ color: 'var(--color-ink-secondary)' }}>Probe latency</dt>
                    <dd data-testid="dhan-verify-latency" style={{ margin: 0 }}>
                      {verification.latencyMs === null ? 'none' : `${verification.latencyMs} ms`}
                    </dd>
                  </dl>
                </>
              ) : (
                <p data-testid="dhan-verify-no-payload" style={{ margin: '8px 0 0' }}>
                  {verifyResult.outcome === 'NOT_ATTEMPTED_NOT_CONFIGURED'
                    ? 'IPD market-data transport is not configured on this server; no verification was attempted.'
                    : verifyResult.outcome === 'TRANSPORT_UNAVAILABLE'
                      ? 'The verification request to the local IPD daemon did not complete. Nothing is claimed about the provider.'
                      : 'IPD answered, but its verification payload failed the governed contract and was rejected fail-closed. Nothing it said is claimed.'}
                </p>
              )}
              <p style={{ margin: '8px 0 0' }}>Reported state (D-7 §8 mapping): {verifyResult.state}</p>
              <p style={{ margin: '4px 0 0' }}>
                Requests issued to IPD: {verifyResult.requestsIssued} · action checked at {verifyResult.checkedAt}
              </p>
              <p style={{ margin: '4px 0 0' }}>
                Live provider contacted by this action: {verifyResult.liveProviderContacted ? 'yes (vendor probe issued)' : 'no (vendor not contacted)'}
              </p>
              <p data-testid="dhan-verify-note" style={{ margin: '8px 0 0', color: 'var(--color-ink-secondary)', fontSize: 12 }}>
                {verifyResult.verificationNote}
              </p>
            </div>
          );
        })()}
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
