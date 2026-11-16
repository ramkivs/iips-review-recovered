/**
 * Typed API client for the IRR DHAN health/readiness surfaces (DHAN-P2; W-10 boundary).
 *
 * Mirrors the server contract 1:1 — no derivation, no transformation, no client-side
 * authority. The server response is the AUTHORITATIVE state; nothing is cached, mirrored or
 * restored from `localStorage`, `sessionStorage` or IndexedDB, and no browser storage is
 * used.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   Every request is made through `noAuthFetch`, which strips any `Authorization` header and
 *   omits credentials. The browser therefore NEVER receives, stores or transmits the IPD
 *   market-data bearer token, a Dhan client id, a Dhan access token, or any SecretRef value.
 *   The responses carry only IPD's D-7 MAY-list fields — enumerated codes, counts, booleans,
 *   backend IDENTIFIERS and ISO-8601 UTC timestamps. They never carry a vault reference,
 *   a keyPath, a carrier path or any secret-store metadata.
 *
 * CONSERVATISM
 *   The client does not compute or upgrade the connection state. It reports the server's
 *   state verbatim and fails closed on a contract violation: a response whose state is not
 *   one of the five governed states is rejected as `transport` rather than surfaced as a
 *   plausible-looking value. The client never renders "authenticated" or "operational" on
 *   its own authority.
 */
import { noAuthFetch } from '../core/network/noAuthFetch';

/** The five governed connection states. Mirrors the server's `DhanHealthState`. */
export type DhanHealthState =
  | 'UNAVAILABLE'
  | 'PRE_ACCESS'
  | 'DISCONNECTED'
  | 'AUTHENTICATED'
  | 'OPERATIONAL';

const DHAN_HEALTH_STATES: readonly DhanHealthState[] = Object.freeze([
  'UNAVAILABLE',
  'PRE_ACCESS',
  'DISCONNECTED',
  'AUTHENTICATED',
  'OPERATIONAL',
]);

/** IPD's normative D-7 §2 eight-state provider vocabulary. Mirrors the server. */
export type DhanProviderState =
  | 'UNCONFIGURED'
  | 'CONFIGURED'
  | 'CREDENTIALS_RESOLVED'
  | 'AUTHENTICATED'
  | 'OPERATIONAL'
  | 'EXPIRED'
  | 'DEGRADED'
  | 'UNAVAILABLE';

const DHAN_PROVIDER_STATES: readonly DhanProviderState[] = Object.freeze([
  'UNCONFIGURED',
  'CONFIGURED',
  'CREDENTIALS_RESOLVED',
  'AUTHENTICATED',
  'OPERATIONAL',
  'EXPIRED',
  'DEGRADED',
  'UNAVAILABLE',
]);

/** Request counters, mirrored structurally. Counts only — never a request identity. */
export interface DhanRequestCounters {
  readonly quoteRequests: number;
  readonly quoteCacheHits: number;
  readonly historicalRequests: number;
  readonly verificationProbes: number;
  readonly vendorRequestsTotal: number;
  readonly vendorSuccesses: number;
  readonly providerFailures: number;
}

/** Cache size/state summary, mirrored structurally. Counts only — never a row. */
export interface DhanQuoteCacheSummary {
  readonly size: number;
  readonly capacity: number;
  readonly state: string;
  readonly currentEntries: number;
  readonly staleEntries: number;
  readonly unavailableEntries: number;
}

/** The last observed provider failure pair. Category only; never a message. */
export interface DhanRecordedFailure {
  readonly category: string;
  readonly at: string;
}

/**
 * The diagnostics-derived view shared by the health report and the verification report.
 * Mirrors the server's `DhanDiagnosticsView` exactly.
 */
export interface DhanDiagnosticsView {
  readonly providerState: DhanProviderState | null;
  readonly service: 'UP' | 'DOWN' | null;
  readonly providerConfiguration: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | null;
  readonly readiness: string;
  readonly credentialResolutionOutcome: string | null;
  readonly liveCredentialResolutionSupported: boolean | null;
  readonly vaultBackendId: string | null;
  readonly vendorEgressMode: string | null;
  readonly liveProviderConnectivity: string;
  readonly providerQualification: string;
  readonly configurationResolved: boolean;
  readonly lastSuccessAt: string | null;
  readonly lastFailureCategory: string | null;
  readonly lastFailure: DhanRecordedFailure | null;
  readonly lastAuthOutcome: string | null;
  readonly lastLatencyMs: number | null;
  readonly consecutiveAuthFailures: number | null;
  readonly authLatched: boolean | null;
  readonly requestCounters: DhanRequestCounters | null;
  readonly qualifiedMappingsLoaded: number | null;
  readonly quoteCache: DhanQuoteCacheSummary | null;
}

/** The provider-neutral health report published by the server. */
export interface DhanHealthReport extends DhanDiagnosticsView {
  readonly state: DhanHealthState;
  readonly providerId: string;
  readonly transportReachable: boolean;
  readonly connectionAttempted: boolean;
  readonly liveProviderContacted: boolean;
  readonly liveQualified: boolean;
  readonly reasons: readonly string[];
  readonly summary: string;
  readonly disclosure: string;
}

/** The enumerated outcomes of the operator-initiated verification action. */
export type DhanVerifyConnectionOutcome =
  | 'OBSERVED'
  | 'NOT_ATTEMPTED_NOT_CONFIGURED'
  | 'TRANSPORT_UNAVAILABLE'
  | 'DIAGNOSTICS_CONTRACT_VIOLATION';

const DHAN_VERIFY_OUTCOMES: readonly DhanVerifyConnectionOutcome[] = Object.freeze([
  'OBSERVED',
  'NOT_ATTEMPTED_NOT_CONFIGURED',
  'TRANSPORT_UNAVAILABLE',
  'DIAGNOSTICS_CONTRACT_VIOLATION',
]);

/** The operator-initiated verification report published by the server. */
export interface DhanVerifyConnectionReport extends DhanDiagnosticsView {
  readonly action: 'VERIFY_CONNECTION';
  readonly attempted: boolean;
  /** How many requests this action issued to IPD. Exactly 1 when attempted, 0 otherwise. */
  readonly requestsIssued: 0 | 1;
  /** Whether THIS action contacted the live vendor. Always false: it issues no vendor call. */
  readonly liveProviderContacted: false;
  readonly outcome: DhanVerifyConnectionOutcome;
  readonly checkedAt: string;
  readonly state: DhanHealthState;
  readonly verificationNote: string;
}

/** Provenance block mirroring the server's transport provenance. */
export interface DhanHealthProvenance {
  readonly dataSource: string;
  readonly asOf: string | null;
  readonly dataVersion: string;
  readonly mode: string;
  readonly freshness: string;
  readonly authority: string;
  readonly transportSemantics: string;
}

export interface DhanHealthEnvelope {
  readonly data: DhanHealthReport;
  readonly provenance: DhanHealthProvenance;
}

export interface DhanVerifyConnectionEnvelope {
  readonly data: DhanVerifyConnectionReport;
  readonly provenance: DhanHealthProvenance;
}

/** Why a health request failed — without an authentication-specific state. */
export type DhanHealthFailureKind = 'transport';

export class DhanHealthApiError extends Error {
  constructor(
    message: string,
    readonly kind: DhanHealthFailureKind,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'DhanHealthApiError';
  }
}

function isDhanHealthState(value: unknown): value is DhanHealthState {
  return typeof value === 'string' && (DHAN_HEALTH_STATES as readonly string[]).includes(value);
}

function isDhanProviderState(value: unknown): value is DhanProviderState {
  return typeof value === 'string' && (DHAN_PROVIDER_STATES as readonly string[]).includes(value);
}

function isDhanVerifyConnectionOutcome(value: unknown): value is DhanVerifyConnectionOutcome {
  return typeof value === 'string' && (DHAN_VERIFY_OUTCOMES as readonly string[]).includes(value);
}

/**
 * Read the DHAN provider health/readiness report.
 *
 * Fails closed: a malformed or contract-violating response is reported as a transport failure
 * and never returned as a plausible-looking state.
 */
export async function fetchDhanHealth(baseUrl = ''): Promise<DhanHealthEnvelope> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/dhan/health`);
  } catch (e) {
    throw new DhanHealthApiError(`dhan health request failed: ${String(e)}`, 'transport', null);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new DhanHealthApiError(
      body.error ?? `dhan health request failed: ${res.status}`,
      'transport',
      res.status,
    );
  }

  let envelope: DhanHealthEnvelope;
  try {
    envelope = (await res.json()) as DhanHealthEnvelope;
  } catch (e) {
    throw new DhanHealthApiError(
      `dhan health response is not valid JSON: ${String(e)}`,
      'transport',
      res.status,
    );
  }

  // Fail closed on a contract violation: never present an unrecognized state as effective.
  if (!isDhanHealthState(envelope?.data?.state)) {
    throw new DhanHealthApiError(
      'dhan health response contract violation: unrecognized connection state',
      'transport',
      res.status,
    );
  }
  // The vendor-contact honesty flag must be present and false — these reads are observational.
  if (envelope.data.liveProviderContacted !== false) {
    throw new DhanHealthApiError(
      'dhan health response contract violation: liveProviderContacted must be false',
      'transport',
      res.status,
    );
  }
  // The authoritative provider state, when present, must be a governed D-7 value.
  if (envelope.data.providerState !== null && !isDhanProviderState(envelope.data.providerState)) {
    throw new DhanHealthApiError(
      'dhan health response contract violation: unrecognized provider state',
      'transport',
      res.status,
    );
  }

  return envelope;
}

/**
 * Invoke the operator-initiated "Verify connection" action.
 *
 * Issues exactly ONE POST to the IRR boundary, which in turn issues exactly one diagnostics
 * request to the local IPD daemon (zero when the transport is not configured). No retry, no
 * loop, no credential resolution, no vendor call. Fails closed on a contract violation.
 */
export async function verifyDhanConnection(baseUrl = ''): Promise<DhanVerifyConnectionEnvelope> {
  let res: Response;
  try {
    res = await noAuthFetch(`${baseUrl}/api/dhan/verify-connection`, { method: 'POST' });
  } catch (e) {
    throw new DhanHealthApiError(`dhan verify-connection request failed: ${String(e)}`, 'transport', null);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new DhanHealthApiError(
      body.error ?? `dhan verify-connection request failed: ${res.status}`,
      'transport',
      res.status,
    );
  }

  let envelope: DhanVerifyConnectionEnvelope;
  try {
    envelope = (await res.json()) as DhanVerifyConnectionEnvelope;
  } catch (e) {
    throw new DhanHealthApiError(
      `dhan verify-connection response is not valid JSON: ${String(e)}`,
      'transport',
      res.status,
    );
  }

  // Fail closed on a contract violation. The action marker, the request count and the
  // enumerated outcome are all part of the contract.
  if (envelope?.data?.action !== 'VERIFY_CONNECTION') {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unexpected action',
      'transport',
      res.status,
    );
  }
  if (envelope.data.requestsIssued !== 0 && envelope.data.requestsIssued !== 1) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unrecognized request count',
      'transport',
      res.status,
    );
  }
  // The vendor-contact honesty flag must be present and false — this action issues no vendor call.
  if (envelope.data.liveProviderContacted !== false) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: liveProviderContacted must be false',
      'transport',
      res.status,
    );
  }
  if (!isDhanVerifyConnectionOutcome(envelope.data.outcome)) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unrecognized outcome',
      'transport',
      res.status,
    );
  }
  if (!isDhanHealthState(envelope.data.state)) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unrecognized connection state',
      'transport',
      res.status,
    );
  }
  if (envelope.data.providerState !== null && !isDhanProviderState(envelope.data.providerState)) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unrecognized provider state',
      'transport',
      res.status,
    );
  }

  return envelope;
}
