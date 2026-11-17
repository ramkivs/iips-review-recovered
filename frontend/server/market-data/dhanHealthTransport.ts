/**
 * IRR DHAN health/readiness HTTP boundary (DHAN-P2; W-10 — IPD authority only).
 *
 * Routes:
 *   GET  /api/dhan/health              → the IRR projection of IPD's authoritative
 *                                        provider state, read from `GET /v1/diagnostics`
 *   POST /api/dhan/verify-connection   → the operator-initiated "Verify connection"
 *                                        affordance: exactly ONE call to IPD's governed
 *                                        `POST /v1/connection/verify` operation via
 *                                        `MarketDataTransportClient.verifyConnection()`
 *                                        (operator-initiated, single-shot, no retry)
 *
 * WHAT THIS MODULE IS
 *   A read-only, credential-free status surface for the DHAN provider. Since W-10 it
 *   derives EVERYTHING from IPD's own `/v1/diagnostics` read over the existing loopback
 *   transport: there is exactly one source of truth for the provider state and it is IPD.
 *   IRR holds no Dhan configuration, resolves no Dhan-credential environment variable and
 *   publishes no SecretRef pointer of any kind.
 *
 * WHAT THIS MODULE IS NOT
 *   - It is NOT a market-data service. It computes no quote, no historical series and no
 *     provider metric, and it holds no price, position or portfolio state.
 *   - It is NOT a second provider client, credential resolver, cache, rate limiter, egress
 *     policy or normalizer — and it is NOT a second verifier. The only IPD surfaces used are
 *     the typed, fail-closed `MarketDataTransportClient.diagnostics()` (IPD W-09) and
 *     `MarketDataTransportClient.verifyConnection()` (IPD W-10), both from the pinned package.
 *     IPD's own validators run inside those calls before IRR sees a payload.
 *   - It performs NO verification of its own. The verify-connection action delegates to
 *     IPD's governed `POST /v1/connection/verify`; IRR neither re-implements the handshake
 *     nor substitutes a weaker check for it. Ordinary diagnostics reads NEVER trigger a
 *     verification; only the operator action issues one.
 *   - It NEVER exposes a credential. No SecretRef reference of any kind is published (D-7
 *     disclosure policy): the response carries only the D-7 MAY list — enumerated codes,
 *     counts, booleans, backend IDENTIFIERS, canonical ISO-8601 UTC timestamps and the
 *     provider-state vocabulary. No vault-reference string, no keyPath, no carrier name, no
 *     secret-store metadata appears in any response or browser payload.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   The browser is never given the IPD bearer token (`IIPS_MARKET_DATA_TRANSPORT_TOKEN`), a
 *   Dhan client id, a Dhan access token, any SecretRef VALUE, or any vault reference.
 *   The environment map consulted for the TRANSPORT (daemon address, transport credential,
 *   timeout) is an explicit dependency supplied at the composition site — never ambient
 *   configuration read inside this module. No Dhan-credential variable is consulted, anywhere
 *   in this module or in the report it publishes.
 *
 * OWNERSHIP
 *   The DHAN provider surface is IPD-owned. This route is IRR-owned CONSUMPTION of that
 *   surface only. It creates no provider authority, promotes no gate, and advances no
 *   qualification. `providerQualification` remains whatever IPD reports.
 *
 * OBSERVATIONAL READS, ONE OPERATOR ACTION
 *   Neither route polls, schedules work or mutates browser-facing state. The health route
 *   is observational end to end. The verify-connection action is operator-initiated only:
 *   opening the screen, loading or retrying the health view never issues a verification
 *   request. IPD performs the verification inside its own daemon — the pinned client issues
 *   at most one `POST /v1/connection/verify` per call, never retries, and validates the
 *   returned contract fail-closed before IRR sees it.
 */

import type http from 'node:http';
import { sendJson } from '../owner-scoped-http';
import {
  buildDhanHealthReport,
  classifyDhanHealth,
  projectDhanDiagnosticsView,
  projectDhanVerificationView,
  type DhanHealthEvidence,
  type DhanHealthReport,
  type DhanDiagnosticsView,
  type DhanVerificationView,
} from './dhanHealthState';
import {
  createIpdMarketDataTransportClient,
  resolveIpdMarketDataTransportConfig,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';
import type {
  DhanEnvSource,
  ServiceConnectionVerification,
  ServiceDiagnostics,
} from 'iips-production-market-data/dhan-server';

/** The health (observational read) route. */
export const DHAN_HEALTH_PATH = '/api/dhan/health';

/** The operator-initiated "Verify connection" route. */
export const DHAN_VERIFY_CONNECTION_PATH = '/api/dhan/verify-connection';

/**
 * Disclosed transport semantics for the UI provenance surface.
 *
 * This states, in the product's own words, exactly what the routes do and — more
 * importantly — what they do NOT establish.
 */
export const DHAN_HEALTH_TRANSPORT_SEMANTICS =
  'READ-ONLY, credential-free DHAN provider status. IPD /v1/diagnostics was read over the ' +
  'loopback transport: no Dhan endpoint was contacted by IRR, no credential was resolved by ' +
  'IRR, and the reported provider state is IPD\u2019s last observed state. The browser receives ' +
  'no bearer token, no client id, no access token and no SecretRef value.';

/** Disclosed semantics for the operator-initiated verification action. */
export const DHAN_VERIFY_CONNECTION_TRANSPORT_SEMANTICS =
  'OPERATOR-INITIATED, single-shot, fail-closed. Exactly one POST /v1/connection/verify is ' +
  'issued to the local IPD daemon; there is no retry, no loop and no credential re-read by ' +
  'IRR. IPD performs its own governed verification (in LIVE_PROBE mode at most one ' +
  'authenticated vendor probe) and answers with the D-7 §3 verification contract, which IPD\u2019s ' +
  'own validator checks fail-closed before IRR sees it. Local credential readiness ' +
  '(\u2018VERIFIED_LOCAL_ONLY\u2019) and vendor authentication (\u2018VERIFIED_VENDOR_ACCEPTED\u2019) are distinct ' +
  'outcomes and are never conflated. The browser receives no bearer token, no client id, no ' +
  'access token and no SecretRef value.';

/** Provenance block carried alongside the report, mirroring the existing IRR envelope shape. */
export const DHAN_HEALTH_PROVENANCE = Object.freeze({
  dataSource: 'ipd:/v1/diagnostics (via iips-production-market-data/dhan-server)',
  asOf: null,
  dataVersion: 'dhan-health-v2',
  mode: 'SNAPSHOT',
  freshness: 'SNAPSHOT',
  authority: 'IPD',
  transportSemantics: DHAN_HEALTH_TRANSPORT_SEMANTICS,
});

/** Provenance block carried alongside the verification report. */
export const DHAN_VERIFY_CONNECTION_PROVENANCE = Object.freeze({
  dataSource: 'ipd:/v1/connection/verify (via iips-production-market-data/dhan-server)',
  asOf: null,
  dataVersion: 'dhan-verify-connection-v2',
  mode: 'SNAPSHOT',
  freshness: 'SNAPSHOT',
  authority: 'IPD',
  transportSemantics: DHAN_VERIFY_CONNECTION_TRANSPORT_SEMANTICS,
});

/**
 * Exact-namespace check: `/api/dhan/health` only. Lookalike paths are rejected so a request
 * can never be served by a broader prefix match.
 */
export function isDhanHealthPath(url: string | undefined): boolean {
  return (url ?? '').split('?')[0] === DHAN_HEALTH_PATH;
}

/**
 * Exact-namespace check: `/api/dhan/verify-connection` only. Lookalike paths are rejected.
 */
export function isDhanVerifyConnectionPath(url: string | undefined): boolean {
  return (url ?? '').split('?')[0] === DHAN_VERIFY_CONNECTION_PATH;
}

/**
 * Dependencies for the routes. The environment map is injected so tests are deterministic and
 * so the route never reads ambient configuration by accident.
 */
export interface DhanHealthRouteDeps {
  /**
   * The environment map consulted ONLY for the IPD transport configuration
   * (`IIPS_MARKET_DATA_*`). The composition site supplies the environment map; no
   * Dhan-credential variable is consulted.
   */
  readonly env?: DhanEnvSource;
  /**
   * A pre-resolved transport configuration. When supplied, it is used verbatim — this is the
   * seam the synthetic fixtures use to inject a controlled transport.
   */
  readonly transport?: IpdTransportConfigResolution;
}

/** The observed result of the single diagnostics read. */
export interface DhanDiagnosticsProbe {
  /** Whether a connection was actually attempted. */
  readonly attempted: boolean;
  /** Whether the transport answered. Meaningful only when `attempted` is true. */
  readonly reachable: boolean;
  /** IPD's validated diagnostics payload, present exactly when `reachable` is true. */
  readonly diagnostics?: ServiceDiagnostics;
  /**
   * Whether the transport answered with a payload IPD's own validator rejected: an unknown
   * connectivity/qualification value, an unsupported diagnostics contract version, or a
   * malformed/contradictory body. Distinct from
   * `reachable === false`: the daemon answered, but its answer is unusable, so the
   * classifier reports `UNAVAILABLE`, never `DISCONNECTED` or an upgraded state.
   */
  readonly contractViolation?: boolean;
}

/**
 * The ONE diagnostics read this module performs — the only IPD request on either route.
 *
 * Exactly one `GET /v1/diagnostics` is issued when (and only when) the transport is
 * configured. There is no retry, no loop, no fallback to a weaker payload, and no other
 * endpoint is contacted. When the transport is not configured, nothing is attempted and
 * nothing is claimed.
 */
export async function readIpdDiagnostics(deps: DhanHealthRouteDeps = {}): Promise<DhanDiagnosticsProbe> {
  const resolution =
    deps.transport ??
    resolveIpdMarketDataTransportConfig(deps.env as Record<string, string | undefined> | undefined);
  if (!resolution.ok) {
    // Not configured: no connection was attempted, so nothing failed.
    return { attempted: false, reachable: false };
  }

  const client = createIpdMarketDataTransportClient(resolution.config);
  let outcome: Awaited<ReturnType<typeof client.diagnostics>>;
  try {
    // Exactly one request is issued here. No retry path exists below this point.
    outcome = await client.diagnostics();
  } catch {
    // Defensive: any unexpected throw is a connection failure, never a claim about the provider.
    return { attempted: true, reachable: false };
  }
  if (!outcome.ok) {
    // W-09 diagnostics contract: `MALFORMED_RESPONSE` means the daemon ANSWERED, but its
    // payload failed IPD's own governed validator. That is a contract violation: attempted,
    // answered, untrustworthy — never DISCONNECTED, and never a live claim.
    if (outcome.failure?.code === 'MALFORMED_RESPONSE') {
      return { attempted: true, reachable: true, contractViolation: true };
    }
    return { attempted: true, reachable: false };
  }
  return { attempted: true, reachable: true, diagnostics: outcome };
}

/**
 * Builds the DhanHealthEvidence from the diagnostics probe.
 *
 * When IPD's payload was read, its values are authoritative and are carried verbatim (IPD's
 * own validator already rejected anything ungoverned). When it was not read, NO provider
 * evidence is invented: the connectivity and qualification axes stay absent, and the
 * classifier will report UNAVAILABLE.
 */
export function collectDhanDiagnosticsEvidence(probe: DhanDiagnosticsProbe): DhanHealthEvidence {
  const d = probe.diagnostics;

  if (probe.contractViolation === true) {
    return {
      healthContractViolation: true,
      connectionAttempted: probe.attempted,
      transportReachable: probe.reachable,
    };
  }

  if (!d) {
    return {
      connectionAttempted: probe.attempted,
      transportReachable: probe.reachable,
    };
  }

  return {
    service: d.service,
    providerConfiguration: d.providerConfiguration,
    providerState: d.providerState,
    liveProviderConnectivity: d.liveProviderConnectivity,
    providerQualification: d.providerQualification,
    readiness: d.providerReadiness,
    credentialResolutionOutcome: d.credentialResolutionOutcome,
    liveCredentialResolutionSupported: d.liveCredentialResolutionSupported,
    vaultBackendId: d.vaultBackendId,
    vendorEgressMode: d.vendorEgressMode,
    configurationResolved: d.providerConfiguration === 'CONFIGURED',
    lastSuccessAt: d.lastSuccessAt,
    lastFailureCategory: d.lastFailureCategory,
    lastFailure: d.lastFailure,
    lastAuthOutcome: d.lastAuthOutcome,
    lastLatencyMs: d.lastLatencyMs,
    consecutiveAuthFailures: d.consecutiveAuthFailures,
    authLatched: d.authLatched,
    requestCounters: d.requestCounters,
    qualifiedMappingsLoaded: d.qualifiedMappingsLoaded,
    quoteCache: d.quoteCache,
    transportReachable: true,
    connectionAttempted: true,
  };
}

/**
 * The observed result of the single verification operation.
 *
 * Exactly one call to IPD's `verifyConnection()` happens when (and only when) the transport
 * is configured. There is no retry, no loop, no fallback verifier and no other endpoint.
 */
export interface DhanVerificationProbe {
  /** Whether a verification request was actually attempted. */
  readonly attempted: boolean;
  /** Whether the IPD daemon answered with a usable (validated) payload, or at all. */
  readonly reachable: boolean;
  /** IPD's validated verification payload, present exactly when `reachable` is true. */
  readonly verification?: ServiceConnectionVerification;
  /**
   * Whether the daemon answered with a payload IPD's own `validateDhanConnectionVerification`
   * rejected. Distinct from `reachable === false`: the daemon answered, but its answer is
   * unusable, so the classifier reports `UNAVAILABLE` and the outcome is
   * `VERIFICATION_CONTRACT_VIOLATION`.
   */
  readonly contractViolation?: boolean;
  /**
   * IPD's enumerated transport failure code when the verification could not be completed
   * (e.g. `TRANSPORT_FAILURE`, `REQUEST_TIMEOUT`). Enumerated code only — never a message.
   */
  readonly failureCode?: string | null;
}

/** Sanitizes an IPD failure code to a bounded enumerated shape before it crosses to the browser. */
function safeFailureCode(code: unknown): string | null {
  return typeof code === 'string' && /^[A-Z0-9_]{1,64}$/.test(code) ? code : null;
}

/**
 * The ONE verification operation this module performs.
 *
 * Exactly one `POST /v1/connection/verify` is issued by IPD's own client when the transport
 * is configured, and zero otherwise. IPD's client never retries: one call is one request.
 */
export async function readIpdVerification(
  deps: DhanHealthRouteDeps = {},
): Promise<DhanVerificationProbe> {
  const resolution =
    deps.transport ??
    resolveIpdMarketDataTransportConfig(deps.env as Record<string, string | undefined> | undefined);
  if (!resolution.ok) {
    // Not configured: no verification was attempted, so nothing failed.
    return { attempted: false, reachable: false };
  }

  const client = createIpdMarketDataTransportClient(resolution.config);
  let outcome: Awaited<ReturnType<typeof client.verifyConnection>>;
  try {
    // Exactly one request is issued here. No retry path exists below this point.
    // No options are passed: IPD's governed default (`LIVE_PROBE`) applies — at most one
    // authenticated vendor probe, decided and performed by IPD inside its own daemon.
    outcome = await client.verifyConnection();
  } catch {
    // Defensive: any unexpected throw is a connection failure, never a claim about the provider.
    return { attempted: true, reachable: false, failureCode: 'TRANSPORT_FAILURE' };
  }
  if (!outcome.ok) {
    // W-10 verification contract: `MALFORMED_RESPONSE` means the daemon ANSWERED, but its
    // payload failed IPD's own governed validator. That is a contract violation: attempted,
    // answered, untrustworthy — never a provider claim of any kind.
    if (outcome.failure?.code === 'MALFORMED_RESPONSE') {
      return { attempted: true, reachable: true, contractViolation: true, failureCode: 'MALFORMED_RESPONSE' };
    }
    return { attempted: true, reachable: false, failureCode: safeFailureCode(outcome.failure?.code) };
  }
  return { attempted: true, reachable: true, verification: outcome };
}

/**
 * Builds the DhanHealthEvidence for the verification report from IPD's VALIDATED
 * verification payload. The nested diagnostics are fed through the same D-7 §8 mapping used
 * by the health report; when the payload is unusable NO provider evidence is invented.
 */
export function collectDhanVerificationEvidence(
  probe: DhanVerificationProbe,
): DhanHealthEvidence {
  const v = probe.verification;

  if (probe.contractViolation === true) {
    return {
      healthContractViolation: true,
      connectionAttempted: probe.attempted,
      transportReachable: probe.reachable,
    };
  }

  if (!v) {
    return {
      connectionAttempted: probe.attempted,
      transportReachable: probe.reachable,
    };
  }

  // IPD's validator already guaranteed diagnostics.providerState === verification.providerState.
  const evidence = collectDhanDiagnosticsEvidence({
    attempted: probe.attempted,
    reachable: probe.reachable,
    diagnostics: v.diagnostics,
  });
  return evidence;
}

/** Produces the full health report for a diagnostics probe. */
export function buildDhanHealthReportFromProbe(probe: DhanDiagnosticsProbe): DhanHealthReport {
  return buildDhanHealthReport(collectDhanDiagnosticsEvidence(probe));
}

/**
 * Handles `GET /api/dhan/health`.
 *
 * The route is read-only, credential-free and identity-free: it establishes no owner context
 * and accepts no tenant, owner, token or credential from the request. It reports the state
 * of the provider, which is a process-level fact rather than a user's private data. Opening
 * the screen or retrying this read issues exactly one IPD diagnostics request.
 */
export async function handleDhanHealthRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DhanHealthRouteDeps = {},
): Promise<void> {
  const url = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';

  res.setHeader('Content-Type', 'application/json');

  if (!isDhanHealthPath(url) || method !== 'GET') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'dhan-health-endpoint-not-found' }));
    return;
  }

  try {
    const probe = await readIpdDiagnostics(deps);
    sendJson(res, 200, { data: buildDhanHealthReportFromProbe(probe), provenance: DHAN_HEALTH_PROVENANCE });
  } catch {
    // Fail closed: a failed assessment is reported as UNAVAILABLE by the caller, and a
    // genuinely broken boundary must not leak an internal error to the browser.
    sendJson(res, 500, { error: 'dhan-health-transport-error' });
  }
}

/** The enumerated dispositions of the operator-initiated verification action. No free text. */
export type DhanVerifyConnectionOutcome =
  /**
   * IPD answered with a D-7 §3 verification payload that passed IPD's own fail-closed
   * validator. `verification.outcome` carries the verdict; IRR claims nothing beyond it.
   */
  | 'EXECUTED'
  /** The IPD transport is not configured; nothing was attempted and nothing is claimed. */
  | 'NOT_ATTEMPTED_NOT_CONFIGURED'
  /** The verification request was attempted and did not produce a usable answer. */
  | 'TRANSPORT_UNAVAILABLE'
  /** The daemon answered, but its verification payload failed IPD's governed contract. */
  | 'VERIFICATION_CONTRACT_VIOLATION';

const DHAN_VERIFY_OUTCOMES: readonly DhanVerifyConnectionOutcome[] = Object.freeze([
  'EXECUTED',
  'NOT_ATTEMPTED_NOT_CONFIGURED',
  'TRANSPORT_UNAVAILABLE',
  'VERIFICATION_CONTRACT_VIOLATION',
]);

/** True only when `value` is a governed route-level verification disposition. */
export function isDhanVerifyConnectionOutcome(value: unknown): value is DhanVerifyConnectionOutcome {
  return typeof value === 'string' && (DHAN_VERIFY_OUTCOMES as readonly string[]).includes(value);
}

/** The operator-initiated verification report. Safe to render, log and assert on. */
export interface DhanVerifyConnectionReport extends DhanDiagnosticsView {
  /** The action this report describes. Always `VERIFY_CONNECTION`. */
  readonly action: 'VERIFY_CONNECTION';
  /** Whether an IPD verification was attempted at all. */
  readonly attempted: boolean;
  /**
   * How many verification requests this action issued to IPD. Exactly 1 when attempted,
   * 0 when the transport is not configured. There is no code path that issues more.
   */
  readonly requestsIssued: 0 | 1;
  /**
   * Whether THIS action issued a vendor probe. Derived from IPD's validated payload
   * (`probeAttempted`); never inferred, and never hard-wired.
   */
  readonly liveProviderContacted: boolean;
  /** The enumerated route-level disposition. Never free text. */
  readonly outcome: DhanVerifyConnectionOutcome;
  /**
   * The enumerated IPD transport failure code when the verification could not be completed,
   * else null. Enumerated code only — never a message.
   */
  readonly failureCode: string | null;
  /**
   * IPD's validated D-7 §3 verification payload projection, or null when no usable payload
   * was returned. `VERIFIED_LOCAL_ONLY` in this block is LOCAL READINESS ONLY — it must
   * never be rendered or described as vendor authentication.
   */
  readonly verification: DhanVerificationView | null;
  /** ISO-8601 UTC instant at which this action completed. */
  readonly checkedAt: string;
  /** The same conservative IRR state mapping used by the health report (D-7 §8). */
  readonly state: ReturnType<typeof classifyDhanHealth>;
  /** Plain-language statement of exactly what this action did and did NOT establish. */
  readonly verificationNote: string;
}

/**
 * The static verification note for each outcome. Plain language, no remote or interpolated
 * values, so nothing the daemon returned can smuggle a message into the disclosure.
 */
export function verificationNoteFor(
  outcome: DhanVerifyConnectionOutcome,
  verificationOutcome: DhanVerificationView['outcome'] | null,
): string {
  if (outcome === 'NOT_ATTEMPTED_NOT_CONFIGURED') {
    return (
      'The IPD market-data transport is not configured on this server. No verification was ' +
      'attempted, no request was issued and nothing is claimed about the provider.'
    );
  }
  if (outcome === 'TRANSPORT_UNAVAILABLE') {
    return (
      'The verification request to the local IPD daemon did not complete. No authentication ' +
      'claim is made, and nothing was retried. The health view remains observational.'
    );
  }
  if (outcome === 'VERIFICATION_CONTRACT_VIOLATION') {
    return (
      'IPD answered, but its verification payload failed the governed D-7 contract and was ' +
      'rejected fail-closed. Nothing it said is claimed, and nothing was retried.'
    );
  }
  switch (verificationOutcome) {
    case 'VERIFIED_VENDOR_ACCEPTED':
      return (
        'IPD executed its governed verification and the vendor accepted authentication. Exactly ' +
        'one authenticated vendor probe was issued by IPD. Local credential readiness and vendor ' +
        'authentication are distinct claims; IPD recorded both.'
      );
    case 'VERIFIED_LOCAL_ONLY':
      return (
        'IPD executed its governed verification. Local credential readiness was established ' +
        'WITHOUT contacting the vendor. This is NOT authentication to the vendor and NOT live ' +
        'connectivity, and it must not be read as either.'
      );
    case 'AUTH_REJECTED':
      return (
        'IPD executed its governed verification and the vendor rejected authentication. No ' +
        'capability beyond that rejection is claimed, and nothing was retried.'
      );
    case 'EXPIRED_LOCAL':
      return (
        'IPD executed its governed verification and determined locally that the credential is ' +
        'expired. The vendor was not contacted, and no authentication claim is made.'
      );
    case 'NOT_ATTEMPTED_NOT_READY':
      return (
        'IPD could not attempt verification because local readiness was not established. The ' +
        'vendor was not contacted, and no authentication claim is made.'
      );
    case 'FAILED_TRANSPORT':
      return (
        'IPD issued its single vendor probe, but the transport failed before an answer was ' +
        'received. No authentication claim is made, and nothing was retried.'
      );
    case 'FAILED_VENDOR_RESPONSE':
      return (
        'IPD issued its single vendor probe, but the vendor response could not be accepted. No ' +
        'authentication claim is made, and nothing was retried.'
      );
    default:
      return (
        'IPD executed its governed verification. Local credential readiness and vendor ' +
        'authentication are distinct claims; only what IPD explicitly reported above is claimed.'
      );
  }
}

/**
 * Handles `POST /api/dhan/verify-connection` — the operator-initiated "Verify connection".
 *
 * Exactly one call to IPD's `verifyConnection()` (i.e. exactly one `POST /v1/connection/verify`
 * to the local IPD daemon) is made when the transport is configured, and zero otherwise.
 * IPD's own fail-closed validator checks the returned contract before IRR sees it. No retry,
 * no loop, no polling, no credential resolution, no IRR-side verification of any kind. The
 * request body, if any, is ignored: the action takes no input.
 */
export async function handleDhanVerifyConnectionRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DhanHealthRouteDeps = {},
): Promise<void> {
  const url = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';

  res.setHeader('Content-Type', 'application/json');

  if (!isDhanVerifyConnectionPath(url) || method !== 'POST') {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'dhan-verify-connection-endpoint-not-found' }));
    return;
  }

  try {
    const probe = await readIpdVerification(deps);
    const checkedAt = new Date().toISOString();
    const evidence = collectDhanVerificationEvidence(probe);
    const verification: DhanVerificationView | null = probe.verification
      ? projectDhanVerificationView(probe.verification)
      : null;
    const outcome: DhanVerifyConnectionOutcome = !probe.attempted
      ? 'NOT_ATTEMPTED_NOT_CONFIGURED'
      : probe.contractViolation === true
        ? 'VERIFICATION_CONTRACT_VIOLATION'
        : probe.reachable
          ? 'EXECUTED'
          : 'TRANSPORT_UNAVAILABLE';

    const report: DhanVerifyConnectionReport = {
      ...projectDhanDiagnosticsView(evidence),
      action: 'VERIFY_CONNECTION',
      attempted: probe.attempted,
      requestsIssued: probe.attempted ? 1 : 0,
      liveProviderContacted: verification?.probeAttempted === true,
      outcome,
      failureCode:
        outcome === 'EXECUTED'
          ? null
          : (probe.failureCode ?? (outcome === 'VERIFICATION_CONTRACT_VIOLATION' ? 'MALFORMED_RESPONSE' : null)),
      verification,
      checkedAt,
      state: classifyDhanHealth(evidence),
      verificationNote: verificationNoteFor(outcome, verification?.outcome ?? null),
    };

    sendJson(res, 200, { data: report, provenance: DHAN_VERIFY_CONNECTION_PROVENANCE });
  } catch {
    sendJson(res, 500, { error: 'dhan-verify-connection-error' });
  }
}
