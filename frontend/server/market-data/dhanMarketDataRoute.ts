/**
 * IRR server-side consumption boundary for the IPD Dhan market-data provider.
 *
 * Authority for this surface:
 *   - Authoritative IPD dependency commit `d5e20c15059267a3f824b015e37d652084de5a01`
 *     (`ramkivs/iips-production-market-data` `main`, merge commit of IPD PR #146). The published
 *     `./dhan-server` closure is byte-identical to the IPD PR #145 merge `709fd13`; only the
 *     dependency revision moved.
 *   - That commit publishes the server-only `./dhan-server` subpath. It is the FIRST
 *     commit reachable from IPD `main` that does so; at the previously pinned primary
 *     commit `279d1eed…` and at the broker-import alias pin `58fc8fb7…` the subpath does
 *     not exist and `src/providers/dhan/**` is absent from the published package.
 *   - The pin advanced here from `59fdfd15` (IPD PR #140) for DHAN-P3: the pinned
 *     `MarketDataTransportClient` at `59fdfd15` carried no timeout, no loopback pinning,
 *     no production guard and no typed failure outcomes, and could not satisfy the
 *     transport requirements of the P3 boundary. The advance is backward compatible for
 *     every symbol this module consumes (Stage-1 `D3D-05`).
 *
 * WHY THIS MODULE EXISTS
 *   IRR already consumes IPD through three pinned surfaces: the primary package
 *   (`./portfolio-ui`, `./pit`, `./d114-non-production`), the DB-C1 broker-import alias
 *   (`iips-broker-import`), and the governed persistence package
 *   (`iips-np04-governed-persistence`). None of them delivers Dhan market data. This
 *   module is the single IRR-owned boundary that consumes the newly published
 *   `./dhan-server` provider surface, so no other IRR module has to know how the
 *   provider is constructed.
 *
 * SCOPE AND REFUSALS (deliberate, and asserted by the accompanying tests)
 *   - PRE-ACCESS. No live Dhan credential, token acquisition, socket or HTTP client
 *     instance is created here. The client is always built with
 *     `PreAccessNoNetworkTransport`, which fails closed, so no accidental live vendor
 *     call can originate from IRR.
 *   - SERVER-SIDE ONLY. This file lives under `server/` and must never be imported from
 *     `src/` browser code or included in the Vite bundle. The IPD `./dhan-server`
 *     contract states the same restriction from its side.
 *   - NO RAW VENDOR SHAPES. Vendor DTOs, security ids and exchange-segment enums are
 *     never re-exposed. Consumers see only the provider-neutral readiness and
 *     configuration description, which carries SecretRef pointers and never secret
 *     values.
 *   - NOTHING IS PROMOTED. This is a consumption boundary, not a repin of the
 *     broker-import alias, not an identity deposition, not a durable-save grant, and
 *     not a Gate 4 / Gate 5 advance.
 */

import {
  DHAN_DEFAULT_BASE_URL,
  DHAN_DEFAULT_TIMEOUT_MS,
  DHAN_PROVIDER_ID,
  PreAccessNoNetworkTransport,
  describeDhanConfig,
  resolveDhanProviderConfig,
  type DhanCredentialReadiness,
  type DhanEnvSource,
} from 'iips-production-market-data/dhan-server';

/**
 * Provider-neutral readiness report. This is the ONLY shape IRR exposes from the Dhan
 * provider surface. It is safe to log, render and assert on: it contains no credential
 * material and no vendor identifiers.
 */
export interface DhanProviderReadiness {
  /** Symbolic SPI provider id owned by IPD (`DHAN_PROVIDER`). Route metadata only. */
  readonly providerId: string;
  /** Whether secret references are configured. Pre-access this is always unavailable. */
  readonly readiness: DhanCredentialReadiness;
  /** Transport endpoint actually resolved, so a misconfiguration is observable. */
  readonly baseUrl: string;
  readonly timeoutMs: number;
  /** Configuration keys that were absent. Never contains a value. */
  readonly missingKeys: readonly string[];
  /** True only when transport configuration resolved without a credential failure. */
  readonly configurationResolved: boolean;
  /**
   * True when this boundary can perform a live vendor call. Structurally false: the
   * boundary always constructs the no-network pre-access transport.
   */
  readonly liveTransportAvailable: boolean;
  /** Deterministic failure code when configuration did not resolve, else null. */
  readonly failureCode: string | null;
  /**
   * The provider's own display-string description of the resolved configuration. Values
   * are `UNCONFIGURED` or a SecretRef key path — never a secret. Kept for operator logs.
   */
  readonly operatorStatus: Record<string, string>;
}

/**
 * Builds the pre-access Dhan provider readiness report from an externally supplied
 * environment map.
 *
 * The environment map is ALWAYS an explicit argument. This function never reads the
 * ambient environment itself, so a deployment cannot accidentally hand credentials to
 * IRR by ambient configuration, and tests can prove the pre-access behaviour exactly.
 */
export function describeDhanProviderReadiness(env: DhanEnvSource = {}): DhanProviderReadiness {
  const resolution = resolveDhanProviderConfig(env);

  // Construct the client transport explicitly so the no-network refusal is proven by
  // construction rather than assumed. This instance is intentionally not returned:
  // IRR exposes readiness, not a live provider handle.
  const preAccessTransport = new PreAccessNoNetworkTransport();
  const transportIsNoNetwork = preAccessTransport instanceof PreAccessNoNetworkTransport;

  if (!transportIsNoNetwork) {
    // Defensive: if the pinned contract ever changes so the pre-access transport is no
    // longer the no-network implementation, fail closed instead of silently opening a
    // vendor path.
    throw new Error(
      'Dhan pre-access boundary requires the no-network transport; refusing to construct a live transport',
    );
  }

  // `describeDhanConfig` renders every field as a display string, so it is used only for
  // the operator status line. Typed readiness fields are read from the resolved config.
  const described = describeDhanConfig(resolution.config);

  return {
    providerId: resolution.config.providerId ?? DHAN_PROVIDER_ID,
    readiness: resolution.config.readiness,
    baseUrl: resolution.config.baseUrl ?? DHAN_DEFAULT_BASE_URL,
    timeoutMs: resolution.config.timeoutMs ?? DHAN_DEFAULT_TIMEOUT_MS,
    missingKeys: [...resolution.config.missingKeys],
    configurationResolved: resolution.ok,
    liveTransportAvailable: false,
    failureCode: resolution.ok ? null : resolution.failure.code,
    operatorStatus: described,
  };
}

/**
 * Human-readable one-line status for operator surfaces. Deliberately derived only from
 * the readiness report, so it can never leak a secret or a vendor identifier.
 */
export function formatDhanProviderStatus(readiness: DhanProviderReadiness): string {
  if (readiness.configurationResolved) {
    return `Dhan provider ${readiness.providerId}: configured, no live transport (pre-access)`;
  }
  return `Dhan provider ${readiness.providerId}: ${readiness.readiness} (${
    readiness.failureCode ?? 'UNKNOWN'
  }); missing ${readiness.missingKeys.join(', ') || 'none'}; no live transport (pre-access)`;
}
