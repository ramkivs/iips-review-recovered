/**
 * IRR DHAN health/readiness STATE MODEL (DHAN-P2, synthetic / pre-access phase; W-10 boundary).
 *
 * Authority:
 *   - IPD provider contract: `ramkivs/iips-production-market-data` @ `d80d77345bed965c2a7e660ef272fd53a234d0a7`
 *     (the published IPD `main` containing W-07 PR #168 `5b384c72…`, W-08 PR #169 `75db511…`
 *     and W-09 PR #170 `a402eee…`), consumed through the server-only `./dhan-server` subpath.
 *     IPD's diagnostics contract (W-09 / D-7 §4.1) is carried verbatim across this boundary:
 *     - `ServiceDiagnostics` (IPD `src/providers/dhan/dhan_market_data_service.ts`):
 *         contractVersion (1), service ('UP'|'DOWN'),
 *         providerState  ('UNCONFIGURED'|'CONFIGURED'|'CREDENTIALS_RESOLVED'|'AUTHENTICATED'
 *                         |'OPERATIONAL'|'EXPIRED'|'DEGRADED'|'UNAVAILABLE'),
 *         providerConfiguration ('CONFIGURED'|'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'),
 *         providerReadiness ('PRE_ACCESS_CREDENTIALS_UNAVAILABLE'|'CREDENTIAL_REFERENCES_CONFIGURED'),
 *         vaultBackendId, liveCredentialResolutionSupported, vendorEgressMode,
 *         credentialResolutionOutcome, liveProviderConnectivity, providerQualification,
 *         lastSuccessAt, lastFailureCategory, lastFailure, lastAuthOutcome, lastLatencyMs,
 *         consecutiveAuthFailures, authLatched, requestCounters, qualifiedMappingsLoaded,
 *         quoteCache.
 *     - `DhanCredentialReadiness` (IPD `src/providers/dhan/dhan_config.ts`):
 *         'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | 'CREDENTIAL_REFERENCES_CONFIGURED'
 *     These enums are kept separate throughout this module and are never interchanged.
 *     The diagnostics payload is validated fail-closed by IPD's own
 *     `validateDhanServiceDiagnostics` (inside the pinned client's `diagnostics()`) before it
 *     reaches this module; every value is still runtime-guarded here because unproven evidence
 *     must never be classified as a capable state.
 *
 * WHAT THIS MODULE IS
 *   A pure, side-effect-free mapping from the AUTHORITATIVE IPD provider state onto exactly
 *   one of five connection states, together with the evidence rules that justify each state.
 *   It is the single place where "what may IRR claim about DHAN" is decided. Since W-10 the
 *   only authority this module consumes is IPD's own diagnostics report: IRR holds NO Dhan
 *   configuration of its own and resolves NO Dhan-credential environment variable.
 *
 * WHAT THIS MODULE IS NOT
 *   - It is NOT a market-data service. It computes no quote, no historical series and no
 *     provider metric, and it holds no price, position or portfolio state.
 *   - It is NOT a second provider client. It consumes IPD's own validated diagnostics; it
 *     never re-implements credential resolution, a cache, a rate limiter, an egress policy
 *     or a normalizer.
 *   - It is NOT a credential resolver and it NEVER reads, derives, forwards or infers a
 *     credential value, a secret reference, or a secret-store location. No SecretRef pointer
 *     of any kind crosses this boundary (D-7 disclosure policy).
 *   - It does NOT contact the IPD daemon, the Dhan vendor or any network host. The transport
 *     integration lives in `dhanHealthTransport.ts`; verification is operator-initiated only.
 *
 * THE FIVE STATES AND WHAT EACH ONE MEANS
 *   UNAVAILABLE  The DHAN capability could not be assessed at all: the diagnostics contract
 *                could not be resolved, the response was malformed or contract-violating, the
 *                evidence contradicted itself, or IPD reported `UNCONFIGURED`/`UNAVAILABLE`.
 *                Nothing is claimed.
 *   PRE_ACCESS   IPD reported a provider state that is credential-ready at best —
 *                `CONFIGURED`, `CREDENTIALS_RESOLVED` or `EXPIRED` (D-7 §8). No live capability
 *                is established; this is the ceiling an offline workstation can reach.
 *   DISCONNECTED IPD reported provider state `DEGRADED` — an interaction was attempted and
 *                failed, latched or otherwise degraded.
 *   AUTHENTICATED IPD reported provider state `AUTHENTICATED`. E4 vendor evidence only;
 *                never inferable from configuration.
 *   OPERATIONAL  IPD reported provider state `OPERATIONAL`. E4 vendor evidence plus IPD's own
 *                live qualification; never inferable from configuration.
 *
 * THE CONSERVATIVE RULE (the whole point of this module)
 *   AUTHENTICATED and OPERATIONAL are EARNED, never assumed. The D-7 §8 mapping from IPD's
 *   eight provider states onto these five states is total and is applied verbatim; an
 *   ungoverned provider state is `UNAVAILABLE`, never an upgrade.
 *
 *   Everything the state reports is a REPORT OF EVIDENCE, never an inference of capability:
 *   the provider state, the resolution outcome, the connectivity and the qualification are
 *   echoed as IPD reported them; the browser is told the truth about what was and was not
 *   established.
 */

import {
  DHAN_PROVIDER_ID,
  type DhanCredentialReadiness,
} from 'iips-production-market-data/dhan-server';

/**
 * The five connection states the IRR DHAN surface may present.
 *
 * `AUTHENTICATED` and `OPERATIONAL` are declared here so the vocabulary is complete and
 * testable, but they are unreachable in this phase — see `classifyDhanHealth`.
 */
export type DhanHealthState =
  | 'UNAVAILABLE'
  | 'PRE_ACCESS'
  | 'DISCONNECTED'
  | 'AUTHENTICATED'
  | 'OPERATIONAL';

/** Every state, in reporting order from least to most capable. */
export const DHAN_HEALTH_STATES: readonly DhanHealthState[] = Object.freeze([
  'UNAVAILABLE',
  'PRE_ACCESS',
  'DISCONNECTED',
  'AUTHENTICATED',
  'OPERATIONAL',
]);

/**
 * The provider's LIVE qualification value. Only a provider that reports a different,
 * explicitly live-qualified value may ever support the OPERATIONAL state.
 */
export const DHAN_LIVE_QUALIFIED = 'LIVE_QUALIFIED';

/**
 * The provider's LIVE connectivity value. Only a provider that reports a different,
 * explicitly checked-live value may ever support AUTHENTICATED or OPERATIONAL.
 */
export const DHAN_LIVE_CONNECTIVITY = 'CONNECTED_LIVE';

/**
 * The complete governed D-7 connectivity vocabulary for `ServiceHealth.liveProviderConnectivity`
 * (roadmap W-07; D-7 accepted by both repositories — see
 * `docs/integration/DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`).
 *
 * The legacy value is preserved; `CONNECTED_LIVE` is the only added value. No other value is
 * governed, and an ungoverned value is a contract violation, never an upgrade signal.
 */
export const DHAN_CONNECTIVITY_VALUES: readonly DhanLiveProviderConnectivity[] = Object.freeze([
  'NOT_CHECKED_PRE_ACCESS',
  DHAN_LIVE_CONNECTIVITY,
]);

/** IPD `ServiceHealth.liveProviderConnectivity`, as a governed D-7 value. */
export type DhanLiveProviderConnectivity = 'NOT_CHECKED_PRE_ACCESS' | 'CONNECTED_LIVE';

/**
 * The complete governed D-7 qualification vocabulary for `ServiceHealth.providerQualification`.
 * The legacy value is preserved; `LIVE_QUALIFIED` is the only added value.
 */
export const DHAN_QUALIFICATION_VALUES: readonly DhanProviderQualification[] = Object.freeze([
  'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  DHAN_LIVE_QUALIFIED,
]);

/** IPD `ServiceHealth.providerQualification`, as a governed D-7 value. */
export type DhanProviderQualification = 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' | 'LIVE_QUALIFIED';

/** True only when `value` is a governed D-7 connectivity value. */
export function isGovernedConnectivityValue(value: unknown): value is DhanLiveProviderConnectivity {
  return value === 'NOT_CHECKED_PRE_ACCESS' || value === DHAN_LIVE_CONNECTIVITY;
}

/** True only when `value` is a governed D-7 qualification value. */
export function isGovernedQualificationValue(value: unknown): value is DhanProviderQualification {
  return value === 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' || value === DHAN_LIVE_QUALIFIED;
}

/**
 * The normative D-7 §2 eight-state provider vocabulary (no aliases, no extras), as published
 * by IPD `/v1/diagnostics`. This is the authority W-10 maps onto IRR's five screen states.
 */
export type DhanProviderState =
  | 'UNCONFIGURED'
  | 'CONFIGURED'
  | 'CREDENTIALS_RESOLVED'
  | 'AUTHENTICATED'
  | 'OPERATIONAL'
  | 'EXPIRED'
  | 'DEGRADED'
  | 'UNAVAILABLE';

/** Every provider state, in reporting order from least to most capable. */
export const DHAN_PROVIDER_STATE_VALUES: readonly DhanProviderState[] = Object.freeze([
  'UNCONFIGURED',
  'CONFIGURED',
  'CREDENTIALS_RESOLVED',
  'AUTHENTICATED',
  'OPERATIONAL',
  'EXPIRED',
  'DEGRADED',
  'UNAVAILABLE',
]);

/** True only when `value` is a governed D-7 provider state. */
export function isGovernedProviderState(value: unknown): value is DhanProviderState {
  return typeof value === 'string' && (DHAN_PROVIDER_STATE_VALUES as readonly string[]).includes(value);
}

/**
 * The diagnostics request counters, mirrored structurally (never imported) so the server
 * boundary stays explicit about exactly which IPD fields it consumes.
 */
export interface DhanDiagnosticsRequestCountersView {
  readonly quoteRequests: number;
  readonly quoteCacheHits: number;
  readonly historicalRequests: number;
  readonly verificationProbes: number;
  readonly vendorRequestsTotal: number;
  readonly vendorSuccesses: number;
  readonly providerFailures: number;
}

/** The diagnostics cache summary, mirrored structurally. */
export interface DhanQuoteCacheView {
  readonly size: number;
  readonly capacity: number;
  readonly state: string;
  readonly currentEntries: number;
  readonly staleEntries: number;
  readonly unavailableEntries: number;
}

/** The diagnostics last-failure pair, mirrored structurally. Category only; never a message. */
export interface DhanRecordedFailureView {
  readonly category: string;
  readonly at: string;
}

/**
 * The authoritative health fields this phase can observe.
 *
 * These are IPD's own values, carried verbatim. They are typed as the governed D-7
 * vocabularies rather than widened strings: an ungoverned value must not be able to enter
 * the classifier as evidence. The transport boundary validates every payload with IPD's own
 * `validateDhanServiceDiagnostics` (inside the pinned client's `diagnostics()`) before this
 * evidence is constructed, and the classifier additionally refuses ungoverned values at
 * runtime (fail-closed), so a cast or a future widened client cannot bypass validation.
 */
export interface DhanHealthEvidence {
  /** IPD `ServiceDiagnostics.service` — the composed market-data service's process availability. */
  readonly service?: 'UP' | 'DOWN' | string;
  /** IPD `ServiceDiagnostics.providerConfiguration` — provider credential configuration state. */
  readonly providerConfiguration?: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | string;
  /** IPD `ServiceDiagnostics.providerState` — the authoritative D-7 §2 eight-state provider vocabulary. */
  readonly providerState?: DhanProviderState | string;
  /** IPD `ServiceDiagnostics.liveProviderConnectivity` — never implies live connectivity pre-access. */
  readonly liveProviderConnectivity?: DhanLiveProviderConnectivity;
  /** IPD `ServiceDiagnostics.providerQualification` — the provider's own qualification verdict. */
  readonly providerQualification?: DhanProviderQualification;
  /**
   * Whether the transport boundary rejected the diagnostics payload as a contract violation
   * (unknown connectivity/qualification value, unknown diagnostics contract version, or a
   * malformed body). When true the classifier reports `UNAVAILABLE`: the daemon answered, but
   * its answer cannot be trusted.
   */
  readonly healthContractViolation?: boolean;
  /** IPD `ServiceDiagnostics.providerReadiness` — whether SecretRef references are configured. */
  readonly readiness?: DhanCredentialReadiness | string;
  /** IPD `ServiceDiagnostics.credentialResolutionOutcome` — enumerated resolution code, never a location. */
  readonly credentialResolutionOutcome?: string | null;
  /** IPD `ServiceDiagnostics.liveCredentialResolutionSupported` — backend readiness, supported or not. */
  readonly liveCredentialResolutionSupported?: boolean | null;
  /** IPD `ServiceDiagnostics.vaultBackendId` — a backend IDENTIFIER (an enumeration), never a location. */
  readonly vaultBackendId?: string | null;
  /** IPD `ServiceDiagnostics.vendorEgressMode` — the governed egress-mode enumeration. */
  readonly vendorEgressMode?: string | null;
  /** Whether the provider configuration resolved without a credential failure. */
  readonly configurationResolved?: boolean;
  /** Epoch-ms-free ISO-8601 UTC timestamp of the last successful provider interaction, if IPD recorded one. */
  readonly lastSuccessAt?: string | null;
  /** The last observed provider failure CATEGORY (governed enumeration), if any. Never a message. */
  readonly lastFailureCategory?: string | null;
  /** The last observed provider failure pair (category + canonical timestamp), if any. */
  readonly lastFailure?: DhanRecordedFailureView | null;
  /** IPD `ServiceDiagnostics.lastAuthOutcome` — enumerated authentication outcome, if observed. */
  readonly lastAuthOutcome?: string | null;
  /** IPD `ServiceDiagnostics.lastLatencyMs` — latency of the last observed interaction, in ms. */
  readonly lastLatencyMs?: number | null;
  /** IPD `ServiceDiagnostics.consecutiveAuthFailures` — bounded counter, not a message. */
  readonly consecutiveAuthFailures?: number | null;
  /** IPD `ServiceDiagnostics.authLatched` — whether the auth-rejection latch is engaged. */
  readonly authLatched?: boolean | null;
  /** IPD `ServiceDiagnostics.requestCounters` — counts only, never a request identity. */
  readonly requestCounters?: DhanDiagnosticsRequestCountersView | null;
  /** IPD `ServiceDiagnostics.qualifiedMappingsLoaded` — a mapping COUNT, never the rows. */
  readonly qualifiedMappingsLoaded?: number | null;
  /** IPD `ServiceDiagnostics.quoteCache` — cache size/state summary, counts only. */
  readonly quoteCache?: DhanQuoteCacheView | null;
  /**
   * Whether the local IPD market-data transport answered.
   *
   * `undefined` means the transport was NEVER ATTEMPTED — "not connected", which is NOT the
   * same as "disconnected". `false` means a connection WAS attempted and failed.
   */
  readonly transportReachable?: boolean;
  /**
   * Whether a transport connection was actually ATTEMPTED for this assessment.
   *
   * This is what distinguishes "the transport was never tried" from "the transport was tried
   * and failed". A failed diagnostics read with no usable payload is reported as
   * `UNAVAILABLE`, never as `DISCONNECTED`: without IPD's provider state there is no evidence
   * that the provider side is configured.
   */
  readonly connectionAttempted?: boolean;
}

/**
 * The IRR-owned, provider-neutral health report. This is the ONLY shape IRR publishes about
 * DHAN health, and it is safe to render, log and assert on.
 */
export interface DhanHealthReport {
  /** The single state IRR reports. */
  readonly state: DhanHealthState;
  /** Symbolic provider id owned by IPD (`DHAN_PROVIDER`). Route metadata only. */
  readonly providerId: string;
  /**
   * IPD's authoritative provider state (D-7 §2), echoed verbatim. Null when the diagnostics
   * contract could not be read: absence means "not assessed", never "unconfigured".
   */
  readonly providerState: DhanProviderState | null;
  /** IPD's process availability for the composed market-data service, RAW echo or null. */
  readonly service: 'UP' | 'DOWN' | null;
  /** IPD's provider-configuration state, echoed verbatim, or null when unreadable. */
  readonly providerConfiguration: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | null;
  /** IPD's credential-reference readiness, echoed verbatim ('UNKNOWN' when unreadable). */
  readonly readiness: DhanCredentialReadiness | string;
  /** IPD's enumerated credential-resolution outcome code, or null when unreadable/absent. */
  readonly credentialResolutionOutcome: string | null;
  /** IPD's backend readiness: live credential resolution supported or not. Null when unreadable. */
  readonly liveCredentialResolutionSupported: boolean | null;
  /** IPD's backend IDENTIFIER (an enumeration), never a location. Null when unreadable. */
  readonly vaultBackendId: string | null;
  /** IPD's governed vendor-egress mode enumeration, or null when unreadable. */
  readonly vendorEgressMode: string | null;
  /** IPD's live-connectivity axis, echoed verbatim ('UNKNOWN' when unreadable). */
  readonly liveProviderConnectivity: string;
  /** IPD's qualification axis, echoed verbatim ('UNKNOWN' when unreadable). */
  readonly providerQualification: string;
  /** Whether the provider configuration resolved without a credential failure. */
  readonly configurationResolved: boolean;
  /** Whether the local IPD transport answered. */
  readonly transportReachable: boolean;
  /**
   * Whether a transport connection was actually ATTEMPTED.
   *
   * `false` distinguishes "the transport was never tried" from "the transport was tried and
   * failed". Without IPD evidence no connection failure may be claimed.
   */
  readonly connectionAttempted: boolean;
  /** Whether a live vendor call was performed by THIS assessment. Always false: IRR's reads are observational. */
  readonly liveProviderContacted: boolean;
  /**
   * Whether IPD's authoritative signals establish live qualification. Derived ONLY from the
   * separately reported connectivity and qualification axes — never from configuration.
   */
  readonly liveQualified: boolean;
  /** IPD's last successful provider interaction timestamp (ISO-8601 UTC), or null. */
  readonly lastSuccessAt: string | null;
  /** IPD's last observed provider failure CATEGORY (governed enumeration), or null. */
  readonly lastFailureCategory: string | null;
  /** IPD's last observed failure pair (category + canonical timestamp), or null. */
  readonly lastFailure: DhanRecordedFailureView | null;
  /** IPD's last observed authentication outcome (enumerated), or null. */
  readonly lastAuthOutcome: string | null;
  /** IPD's last observed interaction latency in milliseconds, or null. */
  readonly lastLatencyMs: number | null;
  /** IPD's bounded consecutive-auth-failure counter, or null when unreadable. */
  readonly consecutiveAuthFailures: number | null;
  /** IPD's auth-rejection latch flag, or null when unreadable. */
  readonly authLatched: boolean | null;
  /** IPD's request counters (counts only), or null when unreadable. */
  readonly requestCounters: DhanDiagnosticsRequestCountersView | null;
  /** IPD's qualified-mapping count, never the rows. Null when unreadable. */
  readonly qualifiedMappingsLoaded: number | null;
  /** IPD's cache size/state summary (counts only), or null when unreadable. */
  readonly quoteCache: DhanQuoteCacheView | null;
  /**
   * The ordered, human-readable reasons the state was assigned. Always explains the state, and
   * always states what was NOT established.
   */
  readonly reasons: readonly string[];
  /**
   * A single-line operator summary. Derived only from this report, so it cannot leak a secret
   * or a vendor identifier.
   */
  readonly summary: string;
  /** Disclosure shown to the operator. States the phase boundary explicitly. */
  readonly disclosure: string;
}

/**
 * The phase disclosure. The surface must never imply live DHAN connectivity or production
 * readiness, so the disclosure is part of the contract rather than a UI afterthought.
 */
export const DHAN_HEALTH_DISCLOSURE =
  'PRE-ACCESS / SYNTHETIC / OFFLINE: the DHAN provider state below is IPD\'s observed state, ' +
  'read read-only from the local IPD daemon. IRR contacted no Dhan endpoint, resolved no ' +
  'credential and holds no Dhan configuration of its own. The provider is NOT live-qualified ' +
  'unless IPD reports it so. This is not live provider data and not production readiness.';

/**
 * Evidence rules, stated once and used by the classifier, the route and the tests.
 *
 * With diagnostics evidence present, the state follows IPD's provider state per the D-7 §8
 * total mapping. Without it, the classifier falls back to the legacy rules: `AUTHENTICATED`
 * and `OPERATIONAL` require an explicitly live connectivity/qualification signal, `DISCONNECTED`
 * requires an attempted failure, and anything unproven is `UNAVAILABLE`.
 */
export function isLiveQualifiedEvidence(evidence: DhanHealthEvidence): boolean {
  return (
    evidence.liveProviderConnectivity === DHAN_LIVE_CONNECTIVITY &&
    evidence.providerQualification === DHAN_LIVE_QUALIFIED
  );
}

/** True only when the provider's connectivity value asserts a checked live connection. */
export function isLiveConnectedEvidence(evidence: DhanHealthEvidence): boolean {
  return evidence.liveProviderConnectivity === DHAN_LIVE_CONNECTIVITY;
}

/**
 * Classifies the observed evidence into exactly one state.
 *
 * The ordering is deliberate and conservative: the most capable state is only reached when
 * every weaker precondition also holds, and no state is ever inferred from the absence of a
 * problem.
 *
 * PRIMARY PATH (W-10) — IPD's provider state was read from `/v1/diagnostics`: the D-7 §8
 * total mapping is applied verbatim (`UNCONFIGURED|UNAVAILABLE → UNAVAILABLE`,
 * `CONFIGURED|CREDENTIALS_RESOLVED|EXPIRED → PRE_ACCESS`, `DEGRADED → DISCONNECTED`,
 * `AUTHENTICATED → AUTHENTICATED`, `OPERATIONAL → OPERATIONAL`).
 *
 * FALLBACK PATH — no provider state available (the diagnostics read did not succeed):
 * 1. `OPERATIONAL`  — live connectivity AND live qualification are both asserted.
 * 2. `AUTHENTICATED` — live connectivity is asserted (authentication accepted by the vendor).
 * 3. `DISCONNECTED` — a connection was ATTEMPTED and FAILED with recorded configuration.
 * 4. `PRE_ACCESS`   — credential references are not configured.
 * 5. `UNAVAILABLE`  — the evidence is missing, malformed or self-contradictory.
 *
 * DISCONNECTED is NEVER inferred from the mere absence of a successful read: an unreadable
 * diagnostics answer reports UNAVAILABLE, and a transport that was never attempted is not
 * "disconnected" either.
 */
export function classifyDhanHealth(evidence: DhanHealthEvidence): DhanHealthState {
  // Contract-violation guard (W-07): the transport boundary rejected the payload — an
  // unknown connectivity/qualification value, an unknown diagnostics contract version, or a
  // malformed body. The daemon answered, but nothing it said may be classified. Checked
  // first, before any other rule.
  if (evidence.healthContractViolation === true) {
    return 'UNAVAILABLE';
  }

  // AUTHORITATIVE DIAGNOSTICS PATH (W-10): when IPD's provider state was read, the D-7 §8
  // mapping is total and is applied verbatim. An ungoverned provider state is unproven
  // evidence and reports UNAVAILABLE — never an upgrade. Connectivity and qualification
  // remain separate axes and are never merged into the state decision (D-7 §4.3).
  if (evidence.providerState !== undefined) {
    if (!isGovernedProviderState(evidence.providerState)) {
      return 'UNAVAILABLE';
    }
    // Contradiction guard: a service that reports itself DOWN while claiming live states is
    // self-contradictory. Nothing can be established from it.
    if (
      evidence.service === 'DOWN' &&
      (evidence.providerState === 'AUTHENTICATED' || evidence.providerState === 'OPERATIONAL')
    ) {
      return 'UNAVAILABLE';
    }
    switch (evidence.providerState) {
      case 'OPERATIONAL':
        return 'OPERATIONAL';
      case 'AUTHENTICATED':
        return 'AUTHENTICATED';
      case 'DEGRADED':
        // IRR's definition of DISCONNECTED — attempted and failed — matches IPD's DEGRADED
        // exactly (D-7 §8).
        return 'DISCONNECTED';
      case 'CONFIGURED':
        // References valid, no material read yet: pre-access posture (D-7 §8).
        return 'PRE_ACCESS';
      case 'CREDENTIALS_RESOLVED':
        // The highest state reachable without a vendor call (D-7 §8).
        return 'PRE_ACCESS';
      case 'EXPIRED':
        // An expired credential cannot attempt access (D-7 §8 / D-2).
        return 'PRE_ACCESS';
      case 'UNCONFIGURED':
      case 'UNAVAILABLE':
        return 'UNAVAILABLE';
    }
  }

  // Runtime vocabulary guard: even a caller that bypasses the transport boundary (or casts
  // an arbitrary string into the governed fields) cannot be classified. An ungoverned value
  // is unproven evidence, and unproven evidence reports UNAVAILABLE — never an upgrade.
  if (
    (evidence.liveProviderConnectivity !== undefined &&
      !isGovernedConnectivityValue(evidence.liveProviderConnectivity)) ||
    (evidence.providerQualification !== undefined &&
      !isGovernedQualificationValue(evidence.providerQualification))
  ) {
    return 'UNAVAILABLE';
  }

  // Contradiction guard: a service that reports itself DOWN while also claiming live
  // connectivity is self-contradictory. Nothing can be established from it.
  if (evidence.service === 'DOWN' && isLiveConnectedEvidence(evidence)) {
    return 'UNAVAILABLE';
  }

  if (isLiveQualifiedEvidence(evidence)) {
    return 'OPERATIONAL';
  }

  if (isLiveConnectedEvidence(evidence)) {
    return 'AUTHENTICATED';
  }

  // The provider is configured AND a connection was actually attempted and failed. Only then
  // is the system "disconnected" — never merely because no connection has been established.
  if (
    evidence.configurationResolved === true &&
    evidence.connectionAttempted === true &&
    evidence.transportReachable === false
  ) {
    return 'DISCONNECTED';
  }

  // Credential references are not configured: the provider is in its governed pre-access mode.
  // This is the expected state of a correctly installed, credential-free workstation.
  if (
    evidence.readiness === 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' ||
    evidence.providerConfiguration === 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'
  ) {
    return 'PRE_ACCESS';
  }

  // The provider configuration resolved, but NO transport connection was attempted and none
  // was established. The provider is therefore configured and connected to nothing: it is in
  // the same pre-access posture as an unconfigured provider — no live capability exists —
  // but its configuration is present. It is NOT "disconnected", because nothing was tried.
  if (evidence.configurationResolved === true && evidence.connectionAttempted !== true) {
    return 'PRE_ACCESS';
  }

  return 'UNAVAILABLE';
}

/**
 * Builds the operator reasons for a state. Every state explains both what WAS established and
 * what was NOT, so an operator is never left to infer a capability the surface did not prove.
 */
export function explainDhanHealth(state: DhanHealthState, evidence: DhanHealthEvidence): readonly string[] {
  const reasons: string[] = [];
  const readiness = evidence.readiness ?? 'UNKNOWN';
  const qualification = evidence.providerQualification ?? 'UNKNOWN';
  const connectivity = evidence.liveProviderConnectivity ?? 'UNKNOWN';
  const providerState = evidence.providerState;
  const outcome = evidence.credentialResolutionOutcome;
  const axes = `Provider qualification is '${qualification}' and provider connectivity is '${connectivity}'.`;

  switch (state) {
    case 'OPERATIONAL':
      reasons.push("IPD reported provider state 'OPERATIONAL': live connectivity and live qualification are established.");
      reasons.push('This state is earned from vendor-side evidence recorded by IPD, never from configuration.');
      reasons.push(axes);
      break;

    case 'AUTHENTICATED':
      reasons.push("IPD reported provider state 'AUTHENTICATED': credentials were accepted by the vendor.");
      reasons.push(
        `Provider qualification is '${qualification}'; the provider is not live-qualified, so it is not operational.`,
      );
      break;

    case 'DISCONNECTED':
      reasons.push('IPD reported provider state \'DEGRADED\': an interaction was attempted and failed.');
      if (evidence.lastFailureCategory) {
        reasons.push(`The last observed failure category was '${evidence.lastFailureCategory}'.`);
      }
      if (evidence.authLatched === true) {
        reasons.push('The authentication-rejection latch is engaged; recovery requires operator intervention.');
      }
      reasons.push(axes);
      break;

    case 'PRE_ACCESS':
      if (providerState === 'EXPIRED') {
        reasons.push("IPD reported provider state 'EXPIRED': the credential cannot be attempted until it is replaced.");
        if (outcome) {
          reasons.push(`Credential resolution outcome: '${outcome}'.`);
        }
      } else if (providerState === 'CREDENTIALS_RESOLVED') {
        reasons.push("IPD reported provider state 'CREDENTIALS_RESOLVED': references resolved without a vendor call.");
      } else if (providerState === 'CONFIGURED') {
        reasons.push("IPD reported provider state 'CONFIGURED': references are valid and have not been read against the vendor.");
      } else if (evidence.configurationResolved === true) {
        reasons.push(
          'The provider configuration resolved, but no live transport connection has been established.',
        );
      } else {
        reasons.push(
          `Credential references are not configured (readiness '${readiness}'), so the provider remains in its governed pre-access mode.`,
        );
      }
      reasons.push('No credential was resolved by IRR and no Dhan endpoint was contacted by IRR.');
      if (evidence.connectionAttempted === true) {
        reasons.push('A local IPD transport read was attempted.');
      } else {
        reasons.push('No local IPD transport connection was attempted.');
      }
      reasons.push(axes);
      break;

    case 'UNAVAILABLE':
    default:
      if (evidence.healthContractViolation === true) {
        reasons.push("IPD answered, but its diagnostics payload failed the governed contract and was rejected fail-closed.");
      } else if (providerState === 'UNCONFIGURED') {
        reasons.push("IPD reported provider state 'UNCONFIGURED': nothing is configured for the provider.");
      } else if (providerState === 'UNAVAILABLE') {
        reasons.push("IPD reported provider state 'UNAVAILABLE': IPD holds insufficient evidence to assess the provider.");
      } else if (providerState === undefined) {
        reasons.push(
          'IPD diagnostics could not be read, so no provider state is claimed. This is not a connection failure: nothing is claimed in either direction.',
        );
      } else {
        reasons.push('The DHAN health contract could not be assessed from the available evidence.');
      }
      reasons.push('No live provider capability is claimed.');
      if (outcome) {
        reasons.push(`Credential resolution outcome: '${outcome}'.`);
      }
      if (evidence.lastFailureCategory) {
        reasons.push(`The last observed failure category was '${evidence.lastFailureCategory}'.`);
      }
      break;
  }

  return reasons;
}

/**
 * The diagnostics-derived view shared by the health report and the operator-initiated
 * verification report. Every field is an enumeration, a count, a boolean or an ISO-8601 UTC
 * timestamp echoed from IPD's validated diagnostics payload; no field can carry secret
 * material, a vault reference or a secret-store location (D-7 §4.1/§4.2).
 */
export interface DhanDiagnosticsView {
  /** IPD's authoritative provider state (D-7 §2), or null when unreadable. */
  readonly providerState: DhanProviderState | null;
  /** IPD's process availability, or null when unreadable. */
  readonly service: 'UP' | 'DOWN' | null;
  /** IPD's provider-configuration state, or null when unreadable. */
  readonly providerConfiguration: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | null;
  /** IPD's credential-reference readiness, echoed verbatim ('UNKNOWN' when unreadable). */
  readonly readiness: string;
  /** IPD's enumerated credential-resolution outcome code, or null when unreadable. */
  readonly credentialResolutionOutcome: string | null;
  /** IPD's backend readiness flag (live credential resolution supported), or null when unreadable. */
  readonly liveCredentialResolutionSupported: boolean | null;
  /** IPD's backend IDENTIFIER (an enumeration), never a location. Null when unreadable. */
  readonly vaultBackendId: string | null;
  /** IPD's governed vendor-egress mode enumeration, or null when unreadable. */
  readonly vendorEgressMode: string | null;
  /** IPD's live-connectivity axis, echoed verbatim ('UNKNOWN' when unreadable). */
  readonly liveProviderConnectivity: string;
  /** IPD's qualification axis, echoed verbatim ('UNKNOWN' when unreadable). */
  readonly providerQualification: string;
  /** Whether the provider configuration resolved without a credential failure. */
  readonly configurationResolved: boolean;
  /** IPD's last successful provider interaction timestamp (ISO-8601 UTC), or null. */
  readonly lastSuccessAt: string | null;
  /** IPD's last observed provider failure CATEGORY (governed enumeration), or null. */
  readonly lastFailureCategory: string | null;
  /** IPD's last observed failure pair (category + canonical timestamp), or null. */
  readonly lastFailure: DhanRecordedFailureView | null;
  /** IPD's last observed authentication outcome (enumerated), or null. */
  readonly lastAuthOutcome: string | null;
  /** IPD's last observed interaction latency in milliseconds, or null. */
  readonly lastLatencyMs: number | null;
  /** IPD's bounded consecutive-auth-failure counter, or null when unreadable. */
  readonly consecutiveAuthFailures: number | null;
  /** IPD's auth-rejection latch flag, or null when unreadable. */
  readonly authLatched: boolean | null;
  /** IPD's request counters (counts only), or null when unreadable. */
  readonly requestCounters: DhanDiagnosticsRequestCountersView | null;
  /** IPD's qualified-mapping count, never the rows. Null when unreadable. */
  readonly qualifiedMappingsLoaded: number | null;
  /** IPD's cache size/state summary (counts only), or null when unreadable. */
  readonly quoteCache: DhanQuoteCacheView | null;
}

/** Projects the diagnostics-derived view from validated evidence. Pure and total. */
export function projectDhanDiagnosticsView(evidence: DhanHealthEvidence): DhanDiagnosticsView {
  const providerState =
    evidence.providerState !== undefined && isGovernedProviderState(evidence.providerState)
      ? evidence.providerState
      : null;
  const service = evidence.service === 'UP' || evidence.service === 'DOWN' ? evidence.service : null;
  const providerConfiguration =
    evidence.providerConfiguration === 'CONFIGURED' ||
    evidence.providerConfiguration === 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'
      ? evidence.providerConfiguration
      : null;
  return {
    providerState,
    service,
    providerConfiguration,
    readiness: evidence.readiness ?? 'UNKNOWN',
    credentialResolutionOutcome: evidence.credentialResolutionOutcome ?? null,
    liveCredentialResolutionSupported: evidence.liveCredentialResolutionSupported ?? null,
    vaultBackendId: evidence.vaultBackendId ?? null,
    vendorEgressMode: evidence.vendorEgressMode ?? null,
    liveProviderConnectivity: evidence.liveProviderConnectivity ?? 'UNKNOWN',
    providerQualification: evidence.providerQualification ?? 'UNKNOWN',
    configurationResolved: evidence.configurationResolved === true,
    lastSuccessAt: evidence.lastSuccessAt ?? null,
    lastFailureCategory: evidence.lastFailureCategory ?? null,
    lastFailure: evidence.lastFailure ?? null,
    lastAuthOutcome: evidence.lastAuthOutcome ?? null,
    lastLatencyMs: evidence.lastLatencyMs ?? null,
    consecutiveAuthFailures: evidence.consecutiveAuthFailures ?? null,
    authLatched: evidence.authLatched ?? null,
    requestCounters: evidence.requestCounters ?? null,
    qualifiedMappingsLoaded: evidence.qualifiedMappingsLoaded ?? null,
    quoteCache: evidence.quoteCache ?? null,
  };
}

/**
 * One-line operator summary, derived only from the report fields.
 */
export function formatDhanHealthSummary(report: DhanHealthReport): string {
  const base = `DHAN health: ${report.state} (${report.providerId})`;
  const providerState = report.providerState ?? 'unknown';
  if (report.state === 'PRE_ACCESS' || report.state === 'DISCONNECTED') {
    return `${base}; IPD provider state ${providerState}; no live transport; not live-qualified`;
  }
  if (report.state === 'AUTHENTICATED') {
    return `${base}; credentials accepted by the provider; provider not live-qualified`;
  }
  if (report.state === 'OPERATIONAL') {
    return `${base}; live connectivity and live qualification established`;
  }
  return `${base}; no provider state claimed`;
}

/**
 * Builds the full IRR health report from the observed evidence.
 *
 * The report carries IPD's D-7 MAY-list fields only: enumerated codes, counts, booleans and
 * ISO-8601 UTC timestamps. It carries NO secret value, NO vault reference, NO SecretRef
 * pointer and NO secret-store metadata of any kind (D-7 §4.2).
 */
export function buildDhanHealthReport(evidence: DhanHealthEvidence): DhanHealthReport {
  const state = classifyDhanHealth(evidence);
  const reasons = explainDhanHealth(state, evidence);
  const view = projectDhanDiagnosticsView(evidence);

  const report: DhanHealthReport = {
    state,
    providerId: DHAN_PROVIDER_ID,
    ...view,
    transportReachable: evidence.transportReachable === true,
    connectionAttempted: evidence.connectionAttempted === true,
    liveProviderContacted: false,
    liveQualified: isLiveQualifiedEvidence(evidence),
    reasons,
    summary: '',
    disclosure: DHAN_HEALTH_DISCLOSURE,
  };

  return { ...report, summary: formatDhanHealthSummary(report) };
}
