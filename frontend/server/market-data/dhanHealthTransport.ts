/**
 * IRR DHAN health/readiness HTTP boundary (DHAN-P2; W-10 — IPD authority only).
 *
 * Routes:
 *   GET  /api/dhan/health              → the IRR projection of IPD's authoritative
 *                                        provider state, read from `GET /v1/diagnostics`
 *   POST /api/dhan/verify-connection   → the operator-initiated "Verify connection"
 *                                        affordance: exactly ONE read-only diagnostics
 *                                        request, operator-initiated, no retry
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
 *     policy or normalizer. The only IPD surface used is the typed, fail-closed
 *     `MarketDataTransportClient.diagnostics()` from the pinned package (IPD W-09), which
 *     validates the payload with IPD's own `validateDhanServiceDiagnostics` before IRR
 *     sees it.
 *   - It is NOT a vendor verification channel. The ordinary health read NEVER contacts the
 *     Dhan vendor; neither does the verify-connection action. A live vendor verification
 *     exists only inside the IPD daemon (W-08 `verifyConnection`) and is NOT exposed over
 *     the transport, so IRR surfaces cannot trigger one — by design, and by construction.
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
 * OBSERVATIONAL READS ONLY
 *   Neither route polls, schedules work, mutates recorder state or triggers a vendor call.
 *   The verify-connection action is operator-initiated only: opening the screen, loading or
 *   retrying the health view never issues more than the single diagnostics read it needs.
 */

import type http from 'node:http';
import { sendJson } from '../owner-scoped-http';
import {
  buildDhanHealthReport,
  classifyDhanHealth,
  projectDhanDiagnosticsView,
  type DhanHealthEvidence,
  type DhanHealthReport,
  type DhanDiagnosticsView,
} from './dhanHealthState';
import {
  createIpdMarketDataTransportClient,
  resolveIpdMarketDataTransportConfig,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';
import type { DhanEnvSource, ServiceDiagnostics } from 'iips-production-market-data/dhan-server';

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
  'OPERATOR-INITIATED, single-shot, read-only. Exactly one /v1/diagnostics request is issued ' +
  'to the local IPD daemon; there is no retry, no loop and no credential re-read. This action ' +
  'observes IPD\u2019s recorded provider state — it does not itself authenticate to the vendor. ' +
  'A live vendor verification exists only inside the IPD daemon and is not exposed over the ' +
  'transport. The browser receives no bearer token, no client id, no access token and no ' +
  'SecretRef value.';

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
  dataSource: 'ipd:/v1/diagnostics (via iips-production-market-data/dhan-server)',
  asOf: null,
  dataVersion: 'dhan-verify-connection-v1',
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

/** The enumerated outcomes of the operator-initiated verification action. No free text. */
export type DhanVerifyConnectionOutcome =
  /** IPD's diagnostics were read; the report carries IPD's observed state. */
  | 'OBSERVED'
  /** The IPD transport is not configured; nothing was attempted and nothing is claimed. */
  | 'NOT_ATTEMPTED_NOT_CONFIGURED'
  /** The diagnostics read was attempted and did not produce a usable answer. */
  | 'TRANSPORT_UNAVAILABLE'
  /** The daemon answered, but its diagnostics payload failed the governed contract. */
  | 'DIAGNOSTICS_CONTRACT_VIOLATION';

/** The operator-initiated verification report. Safe to render, log and assert on. */
export interface DhanVerifyConnectionReport extends DhanDiagnosticsView {
  /** The action this report describes. Always `VERIFY_CONNECTION`. */
  readonly action: 'VERIFY_CONNECTION';
  /** Whether an IPD read was attempted at all. */
  readonly attempted: boolean;
  /**
   * How many requests this action issued to IPD. Exactly 1 when attempted, 0 when the
   * transport is not configured. There is no code path that issues more.
   */
  readonly requestsIssued: 0 | 1;
  /** The enumerated outcome. Never free text. */
  readonly outcome: DhanVerifyConnectionOutcome;
  /** Whether THIS action contacted the live vendor. Always false: it issues no vendor call. */
  readonly liveProviderContacted: false;
  /** ISO-8601 UTC instant at which this action completed. */
  readonly checkedAt: string;
  /** The same conservative IRR state mapping used by the health report (D-7 §8). */
  readonly state: ReturnType<typeof classifyDhanHealth>;
  /** Plain-language statement of exactly what this action did and did NOT establish. */
  readonly verificationNote: string;
}

/**
 * Static disclosure for the verification report. States plainly that this action observes
 * IPD's recorded state and does not perform a vendor-side verification.
 */
export const DHAN_VERIFY_CONNECTION_NOTE =
  'One read-only diagnostics request was issued to the local IPD daemon. No Dhan endpoint ' +
  'was contacted by this action, no credential was resolved or re-read, and nothing was ' +
  'retried. This action observes IPD\u2019s recorded provider state — it does not itself ' +
  'authenticate to the vendor. A live vendor verification exists only inside the IPD daemon.';

/**
 * Handles `POST /api/dhan/verify-connection` — the operator-initiated "Verify connection".
 *
 * Exactly one `/v1/diagnostics` request is issued to IPD when the transport is configured,
 * and zero otherwise. No retry, no loop, no polling, no credential resolution, no vendor
 * call. The request body, if any, is ignored: the action takes no input.
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
    const probe = await readIpdDiagnostics(deps);
    const checkedAt = new Date().toISOString();
    const evidence = collectDhanDiagnosticsEvidence(probe);
    const outcome: DhanVerifyConnectionOutcome = !probe.attempted
      ? 'NOT_ATTEMPTED_NOT_CONFIGURED'
      : probe.contractViolation === true
        ? 'DIAGNOSTICS_CONTRACT_VIOLATION'
        : probe.reachable
          ? 'OBSERVED'
          : 'TRANSPORT_UNAVAILABLE';

    const report: DhanVerifyConnectionReport = {
      ...projectDhanDiagnosticsView(evidence),
      action: 'VERIFY_CONNECTION',
      attempted: probe.attempted,
      requestsIssued: probe.attempted ? 1 : 0,
      liveProviderContacted: false,
      outcome,
      checkedAt,
      state: classifyDhanHealth(evidence),
      verificationNote: DHAN_VERIFY_CONNECTION_NOTE,
    };

    sendJson(res, 200, { data: report, provenance: DHAN_VERIFY_CONNECTION_PROVENANCE });
  } catch {
    sendJson(res, 500, { error: 'dhan-verify-connection-error' });
  }
}
