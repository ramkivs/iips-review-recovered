/**
 * IRR DHAN health/readiness STATE MODEL (DHAN-P2, synthetic / pre-access phase).
 *
 * Authority:
 *   - IPD provider contract: `ramkivs/iips-production-market-data` @ `73768fa83c331de1bd9f51af0a6b26e5ad489ba2`
 *     (merge commit of IPD PR #144), consumed through the server-only `./dhan-server` subpath.
 *     The pin advanced from `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19` (IPD PR #140) in
 *     DHAN-P3 so the transport boundary inherits IPD's timeout, loopback pinning, production
 *     guard and typed failure outcomes. The `ServiceHealth` contract is unchanged by it.
 *     - `ServiceHealth` (IPD `src/providers/dhan/dhan_market_data_service.ts`):
 *         service:                 'UP' | 'DOWN'
 *         providerConfiguration:    'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'
 *         liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS'
 *         providerQualification:    'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'
 *     - `DhanCredentialReadiness` (IPD `src/providers/dhan/dhan_config.ts`):
 *         'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | 'CREDENTIAL_REFERENCES_CONFIGURED'
 *     These are TWO DIFFERENT enums with two overlapping-but-distinct literals. They are kept
 *     separate throughout this module and are never interchanged.
 *
 * WHAT THIS MODULE IS
 *   A pure, side-effect-free mapping from the AUTHORITATIVE IPD health/readiness fields onto
 *   exactly one of five connection states, together with the evidence rules that justify each
 *   state. It is the single place where "what may IRR claim about DHAN" is decided.
 *
 * WHAT THIS MODULE IS NOT
 *   - It is NOT a market-data service. It computes no quote, no historical series and no
 *     provider metric, and it holds no price, position or portfolio state.
 *   - It is NOT a second provider client. It consumes IPD's own configuration resolution and
 *     health vocabulary; it never re-implements credential resolution, a cache, a rate limiter,
 *     an egress policy or a normalizer.
 *   - It is NOT a credential resolver and it NEVER reads, derives, forwards or infers a
 *     credential value. Only SecretRef POINTERS and readiness enums cross this boundary.
 *   - It does NOT contact the IPD daemon, the Dhan vendor or any network host. The transport
 *     integration that would do so is P1 and is explicitly NOT part of this phase.
 *
 * THE FIVE STATES AND WHAT EACH ONE MEANS
 *   UNAVAILABLE  The DHAN capability could not be assessed at all: the health contract could
 *                not be resolved, the response was malformed, or the evidence contradicted
 *                itself. Nothing is claimed.
 *   PRE_ACCESS   IPD's own provider configuration resolved, but credential REFERENCES are not
 *                configured, so the provider is in its governed pre-access mode. This is the
 *                expected state of a correctly installed, credential-free workstation.
 *   DISCONNECTED The provider is configured and credential references resolve, but the IPD
 *                market-data daemon is not reachable on the local transport. The provider side
 *                is configured; the transport side is not connected.
 *   AUTHENTICATED Credentials were presented to the vendor and the vendor accepted them.
 *                Reachable ONLY from an explicit, authoritative authentication-success signal.
 *   OPERATIONAL  The provider is live-qualified: connectivity proven and the provider's own
 *                qualification state says so. Reachable ONLY from an explicit, authoritative
 *                live-qualification signal.
 *
 * THE CONSERVATIVE RULE (the whole point of this module)
 *   AUTHENTICATED and OPERATIONAL are EARNED, never assumed. In this synthetic / pre-access
 *   phase the provider's authoritative qualification value is
 *   'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' and its connectivity value is 'NOT_CHECKED_PRE_ACCESS',
 *   so those two states are UNREACHABLE by construction from the fields available here. A
 *   future phase may reach them, but only by supplying a genuinely authoritative signal — never
 *   by inferring them from the mere presence of configuration, from a credential reference, or
 *   from a successful configuration resolution.
 *
 *   Everything the state reports is a REPORT OF EVIDENCE, never an inference of capability:
 *   the provider id, the readiness enum, the SecretRef pointers and the failure code are
 *   echoed as observed; the browser is told the truth about what was and was not established.
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
 * The authoritative health fields this phase can observe.
 *
 * These are IPD's own values, carried verbatim. They are widened to `string` here ONLY so that
 * an unexpected or future provider value is observable rather than silently coerced into a
 * known literal; the classifier treats any unrecognized value as unproven.
 */
export interface DhanHealthEvidence {
  /** IPD `ServiceHealth.service` — the composed market-data service's process availability. */
  readonly service?: 'UP' | 'DOWN' | string;
  /** IPD `ServiceHealth.providerConfiguration` — provider credential configuration state. */
  readonly providerConfiguration?: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' | string;
  /** IPD `ServiceHealth.liveProviderConnectivity` — never implies live connectivity pre-access. */
  readonly liveProviderConnectivity?: 'NOT_CHECKED_PRE_ACCESS' | string;
  /** IPD `ServiceHealth.providerQualification` — the provider's own qualification verdict. */
  readonly providerQualification?: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' | string;
  /** IPD `DhanCredentialReadiness` — whether SecretRef POINTERS are configured. */
  readonly readiness?: DhanCredentialReadiness | string;
  /** Deterministic failure code from IPD's resolution, e.g. `CREDENTIALS_UNAVAILABLE`. */
  readonly failureCode?: string | null;
  /** Whether the SecretRef pointers resolved into a well-formed configuration. */
  readonly configurationResolved?: boolean;
  /** Configuration keys that were absent. Names only; never values. */
  readonly missingKeys?: readonly string[];
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
   * and failed". The P2 phase initially reported `DISCONNECTED` whenever the transport was
   * unreachable, which conflated the two: a workstation that had simply never contacted the
   * daemon was described as if a connection had been tried and lost. The distinction is
   * explicit now.
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
  /** IPD's credential-reference readiness, echoed verbatim. */
  readonly readiness: DhanCredentialReadiness | string;
  /** Whether the provider configuration resolved without a credential failure. */
  readonly configurationResolved: boolean;
  /** Whether the local IPD transport answered. */
  readonly transportReachable: boolean;
  /**
   * Whether a transport connection was actually ATTEMPTED.
   *
   * This is what distinguishes "the transport was never tried" from "the transport was tried
   * and failed". Only the latter may be reported as `DISCONNECTED`.
   */
  readonly connectionAttempted: boolean;
  /** Whether a live vendor call was performed by this assessment. Always false. */
  readonly liveProviderContacted: boolean;
  /**
   * Whether the provider's own authoritative signals establish live authentication /
   * qualification. False in this phase, and the reason `AUTHENTICATED` / `OPERATIONAL` are
   * not reported.
   */
  readonly liveQualified: boolean;
  /** Deterministic failure code when one was observed, else null. */
  readonly failureCode: string | null;
  /** Configuration keys that were absent. Names only; never values. */
  readonly missingKeys: readonly string[];
  /**
   * SecretRef POINTERS only — the key paths IPD resolved. These are paths, never secret
   * values, and they are what lets an operator see WHICH reference is missing.
   */
  readonly secretRefPointers: readonly string[];
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
  'PRE-ACCESS / SYNTHETIC / OFFLINE: DHAN health is derived from the local IPD provider ' +
  'configuration and readiness only. No Dhan endpoint was contacted, no credential was ' +
  'resolved, and the provider is NOT live-qualified. This is not live provider data and not ' +
  'production readiness.';

/**
 * Evidence rules, stated once and used by the classifier, the route and the tests.
 *
 * `AUTHENTICATED` requires an explicitly live connectivity signal. `OPERATIONAL` additionally
 * requires an explicitly live qualification signal. Anything else is proven to be at most
 * `DISCONNECTED`.
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
 * 1. `OPERATIONAL`  — live connectivity AND live qualification are both asserted.
 * 2. `AUTHENTICATED` — live connectivity is asserted (authentication accepted by the vendor).
 * 3. `DISCONNECTED` — a transport connection was ATTEMPTED and FAILED. The provider side is
 *                     configured, but an observed connection failure occurred.
 * 4. `PRE_ACCESS`   — credential references are not configured; the provider is in its
 *                     governed pre-access mode.
 * 5. `UNAVAILABLE`  — the evidence is missing, malformed or self-contradictory.
 *
 * THE NOT-ATTEMPTED CORRECTION (DHAN-P3): `DISCONNECTED` is reported ONLY when a connection
 * was actually attempted and failed (`connectionAttempted === true` and the transport did not
 * answer). A transport that was never attempted is NOT "disconnected" — the state is
 * `PRE_ACCESS` when the provider is still in pre-access, and the report states explicitly
 * that no connection was attempted. This prevents the surface from describing an untouched
 * workstation as one that had lost a connection.
 */
export function classifyDhanHealth(evidence: DhanHealthEvidence): DhanHealthState {
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

  switch (state) {
    case 'OPERATIONAL':
      reasons.push('The provider asserted live connectivity and live qualification.');
      reasons.push('Live Dhan connectivity was established for this assessment.');
      break;

    case 'AUTHENTICATED':
      reasons.push('The provider asserted live connectivity, so credentials were accepted.');
      reasons.push(
        `Provider qualification is still '${qualification}'; the provider is not live-qualified, so it is not operational.`,
      );
      break;

    case 'DISCONNECTED':
      reasons.push('The provider configuration resolved and its credential references are present.');
      reasons.push(
        'A connection to the local IPD market-data transport was attempted and did not succeed, so no provider round trip occurred.',
      );
      reasons.push(
        `Provider qualification is '${qualification}' and provider connectivity is '${connectivity}'.`,
      );
      break;

    case 'PRE_ACCESS':
      if (evidence.configurationResolved === true) {
        reasons.push(
          'The provider configuration resolved, but no live transport connection has been established.',
        );
      } else {
        reasons.push(
          `Credential references are not configured (readiness '${readiness}'), so the provider remains in its governed pre-access mode.`,
        );
      }
      reasons.push('No credential was resolved and no Dhan endpoint was contacted.');
      if (evidence.connectionAttempted === true) {
        reasons.push('A local transport connection was attempted and did not succeed.');
      } else {
        reasons.push(
          'No local transport connection was attempted, so the transport is not connected rather than disconnected.',
        );
      }
      reasons.push(
        `Provider qualification is '${qualification}' and provider connectivity is '${connectivity}'.`,
      );
      break;

    case 'UNAVAILABLE':
    default:
      reasons.push('The DHAN health contract could not be assessed from the available evidence.');
      reasons.push('No provider state, credential state or connectivity state is claimed.');
      if (evidence.failureCode) {
        reasons.push(`The observed failure code was '${evidence.failureCode}'.`);
      }
      break;
  }

  return reasons;
}

/**
 * One-line operator summary, derived only from the report fields.
 */
export function formatDhanHealthSummary(report: DhanHealthReport): string {
  const base = `DHAN health: ${report.state} (${report.providerId})`;
  if (report.state === 'PRE_ACCESS' || report.state === 'DISCONNECTED') {
    return `${base}; readiness ${report.readiness}; no live transport; not live-qualified`;
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
 * `secretRefPointers` are the SecretRef KEY PATHS IPD resolved. They are pointers, never
 * values, and they are the only credential-adjacent information this report carries.
 */
export function buildDhanHealthReport(
  evidence: DhanHealthEvidence,
  secretRefPointers: readonly string[] = [],
): DhanHealthReport {
  const state = classifyDhanHealth(evidence);
  const reasons = explainDhanHealth(state, evidence);
  const missingKeys = evidence.missingKeys ? [...evidence.missingKeys] : [];

  const report: DhanHealthReport = {
    state,
    providerId: DHAN_PROVIDER_ID,
    readiness: evidence.readiness ?? 'UNKNOWN',
    configurationResolved: evidence.configurationResolved === true,
    transportReachable: evidence.transportReachable === true,
    connectionAttempted: evidence.connectionAttempted === true,
    liveProviderContacted: false,
    liveQualified: isLiveQualifiedEvidence(evidence),
    failureCode: evidence.failureCode ?? null,
    missingKeys,
    secretRefPointers: [...secretRefPointers],
    reasons,
    summary: '',
    disclosure: DHAN_HEALTH_DISCLOSURE,
  };

  return { ...report, summary: formatDhanHealthSummary(report) };
}
