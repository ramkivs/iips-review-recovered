/**
 * Typed API client for the IRR DHAN health/readiness surface (DHAN-P2, synthetic / pre-access phase).
 *
 * Mirrors the server contract 1:1 — no derivation, no transformation, no client-side authority.
 * The server response is the AUTHORITATIVE state; nothing is cached, mirrored or restored from
 * `localStorage`, `sessionStorage` or IndexedDB, and no browser storage is used.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   The request is made through `noAuthFetch`, which strips any `Authorization` header and omits
 *   credentials. The browser therefore NEVER receives, stores or transmits the IPD market-data
 *   bearer token (`IIPS_MARKET_DATA_TRANSPORT_TOKEN`), a Dhan client id or a Dhan access token.
 *   The server publishes only SecretRef POINTERS (key paths) and readiness enums.
 *
 * CONSERVATISM
 *   The client does not compute or upgrade the connection state. It reports the server's state
 *   verbatim and fails closed on a contract violation: a response whose state is not one of the
 *   five governed states is rejected as `transport` rather than surfaced as a plausible-looking
 *   value. The client never renders "authenticated" or "operational" on its own authority.
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

/** The provider-neutral health report published by the server. */
export interface DhanHealthReport {
  readonly state: DhanHealthState;
  readonly providerId: string;
  readonly readiness: string;
  readonly configurationResolved: boolean;
  readonly transportReachable: boolean;
  readonly liveProviderContacted: boolean;
  readonly liveQualified: boolean;
  readonly failureCode: string | null;
  readonly missingKeys: readonly string[];
  /** SecretRef POINTERS only (e.g. `vault://dhan/access-token`). Never a secret value. */
  readonly secretRefPointers: readonly string[];
  readonly reasons: readonly string[];
  readonly summary: string;
  readonly disclosure: string;
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

  return envelope;
}
