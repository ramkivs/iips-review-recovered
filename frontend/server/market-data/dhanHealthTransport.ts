/**
 * IRR DHAN health/readiness HTTP boundary (DHAN-P2, synthetic / pre-access phase).
 *
 * Route: GET /api/dhan/health
 *
 * WHAT THIS ROUTE IS
 *   A read-only, credential-free status surface for the DHAN provider. It answers "what does
 *   IRR know about DHAN right now, and what has it NOT proven?" using IPD's OWN provider
 *   configuration and readiness vocabulary. It publishes exactly one of five states — see
 *   `dhanHealthState.ts` — together with the evidence behind that state.
 *
 * WHAT THIS ROUTE IS NOT
 *   - It is NOT a market-data service. It computes no quote, no historical series and no
 *     provider metric, and it holds no price, position or portfolio state. P3 is not here.
 *   - It is NOT a second provider client, credential resolver, cache, rate limiter, egress
 *     policy or normalizer. It reuses the existing IRR boundary
 *     (`dhanMarketDataRoute.ts` → IPD `resolveDhanProviderConfig`) rather than re-deriving
 *     provider configuration by any other means.
 *   - It is NOT the live IPD transport integration. It does NOT contact the IPD market-data
 *     daemon, and it does NOT contact the Dhan vendor. The local transport is reported as
 *     unreachable in this phase. P1 is not here.
 *   - It NEVER exposes a credential. Only SecretRef POINTERS (key paths) and readiness enums
 *     are published, exactly as IPD's `describeDhanConfig` already renders them.
 *
 * CREDENTIAL AND TRANSPORT SAFETY
 *   The browser is never given the IPD bearer token (`IIPS_MARKET_DATA_TRANSPORT_TOKEN`), a
 *   Dhan client id, a Dhan access token, or any SecretRef VALUE. The route reads no ambient
 *   process environment of its own: the environment map is an explicit dependency so that a
 *   deployment cannot accidentally hand credentials to IRR, and so the behaviour is provable
 *   exactly in tests. IRR-side environment resolution is delegated to IPD's own
 *   `resolveDhanProviderConfig`, which is the single authority for what is configured.
 *
 * OWNERSHIP
 *   The DHAN provider surface is IPD-owned. This route is IRR-owned CONSUMPTION of that
 *   surface only. It creates no provider authority, promotes no gate, and advances no
 *   qualification. `providerQualification` remains whatever IPD reports — in this phase,
 *   `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`.
 */

import type http from 'node:http';
import { sendJson } from '../owner-scoped-http';
import { describeDhanProviderReadiness, type DhanProviderReadiness } from './dhanMarketDataRoute';
import {
  buildDhanHealthReport,
  type DhanHealthEvidence,
  type DhanHealthReport,
} from './dhanHealthState';
import {
  createIpdMarketDataTransportClient,
  resolveIpdMarketDataTransportConfig,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';
import type { DhanEnvSource } from 'iips-production-market-data/dhan-server';

/** The single route this transport serves. */
export const DHAN_HEALTH_PATH = '/api/dhan/health';

/**
 * Disclosed transport semantics for the UI provenance surface.
 *
 * This states, in the product's own words, exactly what the route does and — more
 * importantly — what it does NOT establish.
 */
export const DHAN_HEALTH_TRANSPORT_SEMANTICS =
  'READ-ONLY, credential-free DHAN provider status. The response reports the state IRR can ' +
  'prove from the local IPD provider configuration and readiness only: no Dhan endpoint was ' +
  'contacted, no credential was resolved, the IPD market-data transport was not contacted, and ' +
  'the provider is not live-qualified. The browser receives no bearer token, no client id, no ' +
  'access token and no SecretRef value — only SecretRef POINTERS and readiness enums.';

/** Provenance block carried alongside the report, mirroring the existing IRR envelope shape. */
export const DHAN_HEALTH_PROVENANCE = Object.freeze({
  dataSource: 'ipd:dhan-provider-config (via iips-production-market-data/dhan-server)',
  asOf: null,
  dataVersion: 'dhan-health-v1',
  mode: 'SNAPSHOT',
  freshness: 'SNAPSHOT',
  authority: 'IPD',
  transportSemantics: DHAN_HEALTH_TRANSPORT_SEMANTICS,
});

/**
 * Exact-namespace check: `/api/dhan/health` only. Lookalike paths are rejected so a request
 * can never be served by a broader prefix match.
 */
export function isDhanHealthPath(url: string | undefined): boolean {
  return (url ?? '').split('?')[0] === DHAN_HEALTH_PATH;
}

/**
 * Dependencies for the route. The environment map is injected so tests are deterministic and
 * so the route never reads ambient configuration by accident.
 */
export interface DhanHealthRouteDeps {
  /**
   * The environment map consulted for the DHAN secret-reference POINTERS. Defaults to the
   * process environment at the COMPOSITION site, never inside this module.
   */
  readonly env?: DhanEnvSource;
  /**
   * A pre-resolved transport configuration. When supplied, it is used verbatim — this is the
   * seam the synthetic fixtures use to inject a controlled transport.
   */
  readonly transport?: IpdTransportConfigResolution;
}

/**
 * Extracts the SecretRef POINTERS IPD resolved, so an operator can see WHICH reference is
 * configured and WHICH is missing without ever seeing a value.
 *
 * These are key paths (`vault://…`) or the literal `UNCONFIGURED`. They are copied from IPD's
 * own `describeDhanConfig` rendering, which already guarantees it emits pointers only.
 */
function secretRefPointersOf(readiness: DhanProviderReadiness): readonly string[] {
  const pointers: string[] = [];
  for (const key of ['accessTokenKeyPath', 'clientIdKeyPath']) {
    const value = readiness.operatorStatus[key];
    if (typeof value === 'string' && value.trim() !== '' && value !== 'UNCONFIGURED') {
      pointers.push(value);
    }
  }
  return pointers;
}

/**
 * The observed result of a transport probe.
 *
 * `attempted` distinguishes "the daemon was never contacted" from "the daemon was contacted
 * and did not answer". `reachable` is only meaningful when `attempted` is true.
 */
export interface DhanTransportProbe {
  /** Whether a connection was actually attempted. */
  readonly attempted: boolean;
  /** Whether the transport answered. Meaningful only when `attempted` is true. */
  readonly reachable: boolean;
  /** IPD's authoritative `ServiceHealth`, when the transport answered with a valid payload. */
  readonly serviceHealth?: {
    readonly service: 'UP' | 'DOWN';
    readonly providerConfiguration: 'CONFIGURED' | 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE';
    readonly liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS';
    readonly providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED';
  };
}

/**
 * Builds the observed evidence for the health classification.
 *
 * The transport probe carries the DISTINCTION that matters: a transport that was never
 * attempted is not a connection failure. When no probe has been performed, `connectionAttempted`
 * is false and the classifier reports the state as "not connected" rather than
 * "disconnected".
 */
export function collectDhanHealthEvidence(
  readiness: DhanProviderReadiness,
  probe?: DhanTransportProbe,
): DhanHealthEvidence {
  const attempted = probe?.attempted === true;
  const reachable = probe?.reachable === true;
  const serviceHealth = probe?.serviceHealth;

  return {
    // IPD's own service health is authoritative when the transport answered. Until then the
    // local provider configuration is the only evidence available, and it is stated as such.
    service: serviceHealth?.service ?? 'UP',
    providerConfiguration:
      serviceHealth?.providerConfiguration ??
      (readiness.configurationResolved ? 'CONFIGURED' : 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'),
    liveProviderConnectivity: serviceHealth?.liveProviderConnectivity ?? 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: serviceHealth?.providerQualification ?? 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    readiness: readiness.readiness,
    failureCode: readiness.failureCode,
    configurationResolved: readiness.configurationResolved,
    missingKeys: readiness.missingKeys,
    transportReachable: reachable,
    connectionAttempted: attempted,
  };
}

/**
 * Produces the full health report for a given environment map, without a transport probe.
 *
 * This is the composition point used when the transport is not configured or not probed: IPD
 * resolves the provider configuration, IRR maps it onto one state, and nothing else is
 * consulted.
 */
export function buildDhanHealthReportForEnv(env: DhanEnvSource = {}): DhanHealthReport {
  const readiness = describeDhanProviderReadiness(env);
  const evidence = collectDhanHealthEvidence(readiness);
  return buildDhanHealthReport(evidence, secretRefPointersOf(readiness));
}

/**
 * Produces the full health report WITH a transport probe.
 *
 * When the transport is configured, IRR asks IPD's own client for its health. IPD's answer
 * is authoritative for the provider-side fields; IRR adds only the transport-reachability
 * observation, which IPD cannot make on IRR's behalf.
 */
export async function buildDhanHealthReportWithProbe(
  env: DhanEnvSource = {},
  deps: DhanHealthProbeDeps = {},
): Promise<DhanHealthReport> {
  const readiness = describeDhanProviderReadiness(env);
  const probe = await probeDhanTransport(env, deps);
  const evidence = collectDhanHealthEvidence(readiness, probe);
  return buildDhanHealthReport(evidence, secretRefPointersOf(readiness));
}

/** Dependencies for the transport probe. */
export interface DhanHealthProbeDeps {
  /** A pre-resolved transport configuration. Injected by the synthetic test seam. */
  readonly transport?: IpdTransportConfigResolution;
}

/**
 * Probes the local IPD market-data transport for its authoritative health.
 *
 * The probe is performed ONLY when the transport is configured. An unconfigured transport is
 * NOT probed, and is reported as "not attempted" rather than as a failure — the workstation
 * has simply not been set up for the transport.
 */
export async function probeDhanTransport(
  env: DhanEnvSource = {},
  deps: DhanHealthProbeDeps = {},
): Promise<DhanTransportProbe> {
  const resolution = deps.transport ?? resolveIpdMarketDataTransportConfig(env as Record<string, string | undefined>);
  if (!resolution.ok) {
    // Not configured: no connection was attempted, so nothing failed.
    return { attempted: false, reachable: false };
  }

  const client = createIpdMarketDataTransportClient(resolution.config);
  const outcome = await client.health();
  if (!outcome.ok) {
    // The connection WAS attempted and did not succeed. This is a genuine connection failure.
    return { attempted: true, reachable: false };
  }
  return {
    attempted: true,
    reachable: true,
    serviceHealth: {
      service: outcome.service,
      providerConfiguration: outcome.providerConfiguration,
      liveProviderConnectivity: outcome.liveProviderConnectivity,
      providerQualification: outcome.providerQualification,
    },
  };
}

/**
 * Handles the DHAN health request.
 *
 * The route is read-only, credential-free and identity-free: it establishes no owner context
 * and accepts no tenant, owner, token or credential from the request. It reports the state of
 * the provider, which is a process-level fact rather than a user's private data.
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
    // The transport probe is performed when the transport is configured, so the report can
    // distinguish a genuine connection failure from a transport that was never attempted.
    const report = await buildDhanHealthReportWithProbe(deps.env ?? {}, {
      transport: deps.transport,
    });
    sendJson(res, 200, { data: report, provenance: DHAN_HEALTH_PROVENANCE });
  } catch {
    // Fail closed: a failed assessment is reported as UNAVAILABLE by the caller, and a
    // genuinely broken boundary must not leak an internal error to the browser.
    sendJson(res, 500, { error: 'dhan-health-transport-error' });
  }
}
