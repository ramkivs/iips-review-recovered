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

/** IPD's governed verification modes (D-7 §3). Mirrors the server. */
export type DhanVerificationMode = 'LIVE_PROBE' | 'LOCAL_ONLY';

const DHAN_VERIFICATION_MODES: readonly DhanVerificationMode[] = Object.freeze([
  'LIVE_PROBE',
  'LOCAL_ONLY',
]);

/** IPD's governed verification outcome codes (D-7 §3). Mirrors the server. */
export type DhanVerificationOutcomeCode =
  | 'VERIFIED_VENDOR_ACCEPTED'
  | 'VERIFIED_LOCAL_ONLY'
  | 'AUTH_REJECTED'
  | 'EXPIRED_LOCAL'
  | 'NOT_ATTEMPTED_NOT_READY'
  | 'FAILED_TRANSPORT'
  | 'FAILED_VENDOR_RESPONSE';

const DHAN_VERIFICATION_OUTCOME_CODES: readonly DhanVerificationOutcomeCode[] = Object.freeze([
  'VERIFIED_VENDOR_ACCEPTED',
  'VERIFIED_LOCAL_ONLY',
  'AUTH_REJECTED',
  'EXPIRED_LOCAL',
  'NOT_ATTEMPTED_NOT_READY',
  'FAILED_TRANSPORT',
  'FAILED_VENDOR_RESPONSE',
]);

/** IPD's recorder-observed state, mirrored structurally. Counts/booleans/codes only. */
export interface DhanVerificationObservedStateView {
  readonly lastSuccessAt: string | null;
  readonly lastFailure: DhanRecordedFailure | null;
  readonly lastAuthOutcome: string;
  readonly lastLatencyMs: number | null;
  readonly consecutiveAuthFailures: number;
  readonly authLatched: boolean;
}

/**
 * IPD's validated D-7 §3 verification payload, projected. Every field is an enumeration, a
 * count, a boolean or an ISO-8601 UTC timestamp. `VERIFIED_LOCAL_ONLY` is local credential
 * readiness only — never vendor authentication.
 */
export interface DhanVerificationView {
  readonly contractVersion: 1;
  readonly mode: DhanVerificationMode;
  readonly outcome: DhanVerificationOutcomeCode;
  readonly providerState: DhanProviderState;
  /** Whether V1 local credential readiness was established during this verification. */
  readonly localReadinessEstablished: boolean;
  /** Whether THIS verification issued a vendor probe. */
  readonly probeAttempted: boolean;
  readonly probeCount: 0 | 1;
  readonly failureCategory: string | null;
  readonly checkedAt: string;
  readonly latencyMs: number | null;
  readonly observedState: DhanVerificationObservedStateView;
}

/** The enumerated dispositions of the operator-initiated verification action. */
export type DhanVerifyConnectionOutcome =
  | 'EXECUTED'
  | 'NOT_ATTEMPTED_NOT_CONFIGURED'
  | 'TRANSPORT_UNAVAILABLE'
  | 'VERIFICATION_CONTRACT_VIOLATION';

const DHAN_VERIFY_OUTCOMES: readonly DhanVerifyConnectionOutcome[] = Object.freeze([
  'EXECUTED',
  'NOT_ATTEMPTED_NOT_CONFIGURED',
  'TRANSPORT_UNAVAILABLE',
  'VERIFICATION_CONTRACT_VIOLATION',
]);

/** The operator-initiated verification report published by the server. */
export interface DhanVerifyConnectionReport extends DhanDiagnosticsView {
  readonly action: 'VERIFY_CONNECTION';
  readonly attempted: boolean;
  /** How many requests this action issued to IPD. Exactly 1 when attempted, 0 otherwise. */
  readonly requestsIssued: 0 | 1;
  /** Whether THIS action issued a vendor probe (IPD-validated `probeAttempted`). */
  readonly liveProviderContacted: boolean;
  readonly outcome: DhanVerifyConnectionOutcome;
  /** Enumerated IPD transport failure code, or null. Never a message. */
  readonly failureCode: string | null;
  /** IPD's validated D-7 §3 verification projection, or null when no usable payload returned. */
  readonly verification: DhanVerificationView | null;
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

function isDhanVerificationMode(value: unknown): value is DhanVerificationMode {
  return typeof value === 'string' && (DHAN_VERIFICATION_MODES as readonly string[]).includes(value);
}

function isDhanVerificationOutcomeCode(value: unknown): value is DhanVerificationOutcomeCode {
  return typeof value === 'string' && (DHAN_VERIFICATION_OUTCOME_CODES as readonly string[]).includes(value);
}

/**
 * Fail-closed structural check of IPD's projected verification payload. Mirrors the
 * invariants IPD's own `validateDhanConnectionVerification` enforces (which already ran
 * inside the pinned client); the client refuses to render a payload that breaks them.
 */
function isDhanVerificationView(value: unknown): value is DhanVerificationView {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (v.contractVersion !== 1) return false;
  if (!isDhanVerificationMode(v.mode)) return false;
  if (!isDhanVerificationOutcomeCode(v.outcome)) return false;
  if (!isDhanProviderState(v.providerState)) return false;
  if (typeof v.localReadinessEstablished !== 'boolean') return false;
  if (typeof v.probeAttempted !== 'boolean') return false;
  if (v.probeCount !== 0 && v.probeCount !== 1) return false;
  if (v.probeCount !== (v.probeAttempted === true ? 1 : 0)) return false;
  if (v.mode === 'LOCAL_ONLY' && v.probeAttempted === true) return false;
  if (v.failureCategory !== null && typeof v.failureCategory !== 'string') return false;
  if (typeof v.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v.checkedAt)) {
    return false;
  }
  if (v.latencyMs !== null && (typeof v.latencyMs !== 'number' || !Number.isFinite(v.latencyMs) || v.latencyMs < 0)) {
    return false;
  }
  if (!v.probeAttempted && v.latencyMs !== null) return false;
  const observed = v.observedState;
  if (!observed || typeof observed !== 'object' || Array.isArray(observed)) return false;
  const o = observed as Record<string, unknown>;
  if (o.lastSuccessAt !== null && typeof o.lastSuccessAt !== 'string') return false;
  if (typeof o.lastAuthOutcome !== 'string') return false;
  if (typeof o.consecutiveAuthFailures !== 'number' || !Number.isInteger(o.consecutiveAuthFailures) || o.consecutiveAuthFailures < 0) return false;
  if (typeof o.authLatched !== 'boolean') return false;
  return true;
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
 * Issues exactly ONE POST to the IRR boundary, which in turn issues exactly one call to
 * IPD's `POST /v1/connection/verify` operation (zero when the transport is not configured).
 * IPD performs its own governed verification — in LIVE_PROBE mode at most one authenticated
 * vendor probe — and validates its own contract before the response is built. No retry, no
 * loop, no credential resolution, no IRR-side verification. Fails closed on a contract
 * violation. `VERIFIED_LOCAL_ONLY` is local readiness only and is never vendor authentication.
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

  // Fail closed on a contract violation. The action marker, the request count, the honesty
  // flag, the enumerated outcome, the route-level disposition and the verification payload
  // are all part of the contract.
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
  if (typeof envelope.data.attempted !== 'boolean') {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: missing attempted flag',
      'transport',
      res.status,
    );
  }
  if (envelope.data.attempted === false && envelope.data.requestsIssued !== 0) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unattempted action issued requests',
      'transport',
      res.status,
    );
  }
  if (envelope.data.attempted === true && envelope.data.requestsIssued !== 1) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: attempted action issued unexpected request count',
      'transport',
      res.status,
    );
  }
  if (typeof envelope.data.liveProviderContacted !== 'boolean') {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: missing vendor-contact flag',
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
  if (envelope.data.failureCode !== null && typeof envelope.data.failureCode !== 'string') {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: unrecognized failure code',
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
  // The verification payload must be present exactly when the route reports EXECUTED, and
  // must pass the full fail-closed structural check when present.
  if (envelope.data.outcome === 'EXECUTED') {
    if (!isDhanVerificationView(envelope.data.verification)) {
      throw new DhanHealthApiError(
        'dhan verify-connection response contract violation: missing or invalid verification payload',
        'transport',
        res.status,
      );
    }
  } else if (envelope.data.verification !== null) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: verification payload present on a non-EXECUTED outcome',
      'transport',
      res.status,
    );
  }
  // The vendor-contact honesty flag is derived from IPD's validated probeAttempted — never
  // inferred, never defaulted.
  const expectedLiveProviderContacted = envelope.data.verification?.probeAttempted === true;
  if (envelope.data.liveProviderContacted !== expectedLiveProviderContacted) {
    throw new DhanHealthApiError(
      'dhan verify-connection response contract violation: vendor-contact flag contradicts the verification payload',
      'transport',
      res.status,
    );
  }

  return envelope;
}
