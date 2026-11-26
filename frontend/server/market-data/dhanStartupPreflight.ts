/**
 * W-38 — local startup readiness preflight for the IRR ↔ IPD market-data integration.
 *
 * One read, seven governed checks:
 *   1. transport configuration and loopback binding
 *   2. daemon reachability
 *   3. transport-token authentication
 *   4. backend active and ready status
 *   5. instrument mapping count > 0
 *   6. provider state
 *   7. token expiry proximity
 *
 * AUTHORITY
 *   IPD owns the transport and the provider state. This module performs exactly ONE
 *   authenticated `GET /v1/diagnostics` through IPD's own validated `MarketDataTransportClient`;
 *   it adds no second client, no vendor request and no provider credential resolution. Every
 *   reported value is either IPD's governed enumeration/count or a fixed IRR diagnostic.
 *
 * DISCLOSURE
 *   The report contains only statuses and fixed explanatory sentences. It never renders the
 *   transport credential, a Dhan credential, a URL, a filesystem/carrier path, a vault-scheme
 *   reference, a raw provider message or a client error string. Failure codes are mapped to
 *   fixed text so an upstream error cannot echo configuration material into the report.
 *
 * EXPIRY LIMIT
 *   D-7's diagnostics wire publishes the governed resolution outcome and provider state, not a
 *   numeric seconds-to-expiry value. This check therefore reports expiry PROXIMITY only through
 *   those governed facts (`CREDENTIALS_RESOLVED` versus `CREDENTIALS_EXPIRED` / `EXPIRED`), never
 *   by inventing a countdown or reading a local carrier.
 */

import {
  createIpdMarketDataTransportClient,
  resolveIpdMarketDataTransportConfig,
  type IpdTransportConfigResolution,
} from './dhanMarketDataTransport';

/** The three outcomes every W-38 check may report. */
export type PreflightStatus = 'PASS' | 'FAIL' | 'CONFIG-MISSING';

/** Stable identifiers, one for each required W-38 check. */
export type PreflightCheckId =
  | 'transport-config'
  | 'daemon-reachable'
  | 'token-auth'
  | 'backend-active-ready'
  | 'instrument-mappings'
  | 'provider-state'
  | 'token-expiry';

export interface PreflightCheck {
  readonly id: PreflightCheckId;
  readonly status: PreflightStatus;
  /** Fixed, precise explanation. Never contains a credential, path or vault reference. */
  readonly detail: string;
}

export interface PreflightReport {
  readonly checks: readonly PreflightCheck[];
  /** READY only when all seven checks PASS; never inferred from a subset. */
  readonly overall: 'READY' | 'NOT_READY';
}

/** Test seam: an injected fetch implementation is forwarded to IPD's own client. */
export interface StartupPreflightDeps {
  readonly fetchImpl?: typeof fetch;
}

const NOT_EVALUATED = 'Not evaluated: the transport configuration is not usable.';
const NOT_AUTHENTICATED = 'Not evaluated: the transport credential was not accepted.';
const NO_PAYLOAD = 'Not evaluated: IPD returned no usable diagnostics payload.';

function check(id: PreflightCheckId, status: PreflightStatus, detail: string): PreflightCheck {
  return { id, status, detail };
}

/** Fixed diagnostics for transport-configuration failures; no configured value is rendered. */
function configurationFailureDetail(code: string): string {
  switch (code) {
    case 'NOT_CONFIGURED':
      return 'Transport configuration is absent: the daemon address and transport credential settings must both be present.';
    case 'MALFORMED_BASE_URL':
      return 'Transport configuration is invalid: the configured daemon address is not a parseable URL.';
    case 'NON_LOOPBACK_BASE_URL':
      return 'Transport configuration is refused: the daemon address must be a loopback HTTP endpoint without embedded credentials or query data.';
    default:
      return 'Transport configuration is not usable.';
  }
}

/** Fixed diagnostics for client failures, keyed by IPD's governed failure code only. */
function transportFailureDetail(code: string): string {
  switch (code) {
    case 'TIMEOUT':
      return 'The loopback diagnostics request exceeded its configured timeout.';
    case 'TRANSPORT_FAILURE':
      return 'The loopback daemon refused the connection or the connection failed before an HTTP response.';
    case 'MALFORMED_RESPONSE':
      return 'The daemon answered, but its diagnostics payload failed IPD’s own fail-closed validator.';
    case 'UNAUTHENTICATED':
      return 'The daemon rejected the transport credential (HTTP 401).';
    default:
      return `The diagnostics request failed with IPD failure code ${code}.`;
  }
}

function unevaluated(reason: string): PreflightCheck[] {
  return [
    check('daemon-reachable', 'CONFIG-MISSING', reason),
    check('token-auth', 'CONFIG-MISSING', reason),
    check('backend-active-ready', 'CONFIG-MISSING', reason),
    check('instrument-mappings', 'CONFIG-MISSING', reason),
    check('provider-state', 'CONFIG-MISSING', reason),
    check('token-expiry', 'CONFIG-MISSING', reason),
  ];
}

function finish(
  transport: PreflightCheck,
  rest: readonly PreflightCheck[],
): PreflightReport {
  const checks = [transport, ...rest];
  return {
    checks,
    overall: checks.every((item) => item.status === 'PASS') ? 'READY' : 'NOT_READY',
  };
}

/**
 * Runs the seven W-38 checks against the supplied server-side environment map.
 *
 * The environment is ALWAYS explicit; this function never reads ambient configuration. No
 * check mutates state, starts a process, contacts a vendor or triggers a verification probe.
 */
export async function runStartupPreflight(
  env: Readonly<Record<string, string | undefined>>,
  deps: StartupPreflightDeps = {},
): Promise<PreflightReport> {
  const resolution: IpdTransportConfigResolution = resolveIpdMarketDataTransportConfig(env);
  if (!resolution.ok) {
    const missing = resolution.code === 'NOT_CONFIGURED';
    return finish(
      check(
        'transport-config',
        missing ? 'CONFIG-MISSING' : 'FAIL',
        configurationFailureDetail(resolution.code),
      ),
      unevaluated(NOT_EVALUATED),
    );
  }

  const transport = check(
    'transport-config',
    'PASS',
    'Transport settings are present and pass the loopback HTTP and credential-hygiene guards.',
  );
  const client = createIpdMarketDataTransportClient(
    resolution.config,
    deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : undefined,
  );

  let outcome;
  try {
    outcome = await client.diagnostics();
  } catch {
    // IPD's client is fail-closed and does not throw for expected failures; a throw is a
    // defect, so report it as a transport failure without echoing the exception text.
    return finish(transport, [
      check('daemon-reachable', 'FAIL', transportFailureDetail('TRANSPORT_FAILURE')),
      ...unevaluated(NO_PAYLOAD).slice(1),
    ]);
  }

  if (!outcome.ok) {
    const { failure } = outcome;
    const answered = failure.httpStatus !== undefined;
    const authenticated = failure.code !== 'UNAUTHENTICATED' && failure.code !== 'PRODUCTION_NOT_AUTHORIZED';
    const detail = transportFailureDetail(failure.code);
    return finish(transport, [
      check(
        'daemon-reachable',
        answered || failure.code === 'MALFORMED_RESPONSE' ? 'PASS' : 'FAIL',
        answered || failure.code === 'MALFORMED_RESPONSE'
          ? `The loopback daemon answered: ${detail}`
          : detail,
      ),
      check(
        'token-auth',
        failure.code === 'UNAUTHENTICATED'
          ? 'FAIL'
          : answered && authenticated
            ? 'PASS'
            : 'CONFIG-MISSING',
        failure.code === 'UNAUTHENTICATED'
          ? detail
          : answered && authenticated
            ? 'The daemon accepted the transport credential for the diagnostics read.'
            : NOT_AUTHENTICATED,
      ),
      ...unevaluated(NO_PAYLOAD).slice(2),
    ]);
  }

  const d = outcome;
  const backend =
    d.service === 'UP'
      ? check('backend-active-ready', 'PASS', 'IPD reports its composed market-data service as UP.')
      : check('backend-active-ready', 'FAIL', 'IPD reports its composed market-data service as DOWN.');

  const mappings =
    Number.isFinite(d.qualifiedMappingsLoaded) && d.qualifiedMappingsLoaded > 0
      ? check(
          'instrument-mappings',
          'PASS',
          `IPD reports ${d.qualifiedMappingsLoaded} qualified instrument mappings loaded.`,
        )
      : Number.isFinite(d.qualifiedMappingsLoaded)
        ? check(
            'instrument-mappings',
            'FAIL',
            'IPD reports zero qualified instrument mappings loaded.',
          )
        : check('instrument-mappings', 'CONFIG-MISSING', NO_PAYLOAD);

  const readyStates = new Set(['CONFIGURED', 'CREDENTIALS_RESOLVED', 'AUTHENTICATED', 'OPERATIONAL']);
  const stateStatus: PreflightStatus =
    d.providerState === 'UNCONFIGURED'
      ? 'CONFIG-MISSING'
      : readyStates.has(d.providerState)
        ? 'PASS'
        : 'FAIL';
  const providerState = check(
    'provider-state',
    stateStatus,
    stateStatus === 'PASS'
      ? `IPD reports provider state ${d.providerState}.`
      : stateStatus === 'CONFIG-MISSING'
        ? `IPD reports provider state ${d.providerState}; no provider configuration is available.`
        : `IPD reports provider state ${d.providerState}; the provider is not ready for use.`,
  );

  const expiryFailed =
    d.credentialResolutionOutcome === 'CREDENTIALS_EXPIRED' ||
    d.providerState === 'EXPIRED' ||
    d.credentialResolutionOutcome === 'PRODUCTION_NOT_AUTHORIZED';
  const expiryMissing = [
    'UNCONFIGURED',
    'CONFIGURATION_INCOMPLETE',
    'CREDENTIALS_UNAVAILABLE',
    'CONFIGURED_NOT_RESOLVED',
  ].includes(d.credentialResolutionOutcome);
  const tokenExpiry = check(
    'token-expiry',
    expiryFailed ? 'FAIL' : expiryMissing ? 'CONFIG-MISSING' : 'PASS',
    expiryFailed
      ? `IPD reports token expiry state ${d.credentialResolutionOutcome}; re-provisioning is required.`
      : expiryMissing
        ? `IPD reports token readiness ${d.credentialResolutionOutcome}; no usable credential expiry evidence is available.`
        : 'IPD reports a resolved credential; no expiry timestamp is published on the D-7 wire, so proximity is assessed from that governed outcome only.',
  );

  return finish(transport, [
    check('daemon-reachable', 'PASS', 'The loopback daemon answered an authenticated diagnostics read.'),
    check('token-auth', 'PASS', 'The transport credential was accepted for the diagnostics read.'),
    backend,
    mappings,
    providerState,
    tokenExpiry,
  ]);
}

/** Renders a report as a stable, disclosure-safe text block. */
export function formatPreflightReport(report: PreflightReport): string {
  const lines = [
    'W-38 startup readiness preflight',
    ...report.checks.map((item) => `${item.status.padEnd(13)} ${item.id.padEnd(20)} ${item.detail}`),
    `RESULT ${report.overall}`,
  ];
  return lines.join('\n');
}
