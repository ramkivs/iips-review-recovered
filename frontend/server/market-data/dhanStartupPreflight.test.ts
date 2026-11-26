/**
 * W-38 — startup readiness preflight tests.
 *
 * Every response below is a synthetic IPD diagnostics payload served through an injected fetch
 * seam. No Dhan credential is read, no vendor endpoint is contacted, no process is started and
 * no filesystem path is published.
 */
import { describe, it, expect } from 'vitest';

import {
  formatPreflightReport,
  runStartupPreflight,
  type PreflightCheckId,
  type PreflightReport,
  type PreflightStatus,
} from './dhanStartupPreflight';

const TOKEN = 'w38-synthetic-transport-token';
const BASE_URL = 'http://127.0.0.1:8791';

function env(overrides: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    IIPS_MARKET_DATA_BASE_URL: BASE_URL,
    IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
    IIPS_MARKET_DATA_TIMEOUT_MS: '1000',
    ...overrides,
  };
}

/** A fully valid IPD W-09 diagnostics payload; overrides isolate one broken fact at a time. */
function diagnostics(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: 1,
    service: 'UP',
    providerState: 'OPERATIONAL',
    providerConfiguration: 'CONFIGURED',
    providerReadiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
    vaultBackendId: 'WINDOWS_DPAPI',
    liveCredentialResolutionSupported: true,
    vendorEgressMode: 'IPD_SERVER_HTTPS',
    credentialResolutionOutcome: 'CREDENTIALS_RESOLVED',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    lastSuccessAt: null,
    lastFailureCategory: null,
    lastFailure: null,
    lastAuthOutcome: 'NOT_CHECKED',
    lastLatencyMs: null,
    consecutiveAuthFailures: 0,
    authLatched: false,
    requestCounters: {
      quoteRequests: 3,
      quoteCacheHits: 1,
      historicalRequests: 2,
      verificationProbes: 0,
      vendorRequestsTotal: 9,
      vendorSuccesses: 7,
      providerFailures: 1,
    },
    qualifiedMappingsLoaded: 12,
    quoteCache: {
      size: 2,
      capacity: 256,
      state: 'CURRENT',
      currentEntries: 2,
      staleEntries: 0,
      unavailableEntries: 0,
    },
    ...overrides,
  };
}

function jsonFetch(
  body: unknown,
  status = 200,
  calls: string[] = [],
): typeof fetch {
  return (async (input: string | URL | Request) => {
    calls.push(String(input));
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
}

function statusMap(report: PreflightReport): Record<PreflightCheckId, PreflightStatus> {
  return Object.fromEntries(report.checks.map((c) => [c.id, c.status])) as Record<
    PreflightCheckId,
    PreflightStatus
  >;
}

const ALL_PASS: Record<PreflightCheckId, PreflightStatus> = {
  'transport-config': 'PASS',
  'daemon-reachable': 'PASS',
  'token-auth': 'PASS',
  'backend-active-ready': 'PASS',
  'instrument-mappings': 'PASS',
  'provider-state': 'PASS',
  'token-expiry': 'PASS',
};

describe('W-38 startup readiness preflight', () => {
  it('reports READY with seven distinct PASS checks after exactly one diagnostics read', async () => {
    const calls: string[] = [];
    const report = await runStartupPreflight(env(), {
      fetchImpl: jsonFetch(diagnostics(), 200, calls),
    });

    expect(report.checks).toHaveLength(7);
    expect(statusMap(report)).toEqual(ALL_PASS);
    expect(report.overall).toBe('READY');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain('/v1/diagnostics');
  });

  it('produces disclosure-safe output', async () => {
    const report = await runStartupPreflight(env(), { fetchImpl: jsonFetch(diagnostics()) });
    const output = `${formatPreflightReport(report)} ${JSON.stringify(report)}`;

    expect(output).not.toContain(TOKEN);
    expect(output).not.toContain('Bearer ');
    expect(output).not.toMatch(/vault:\/\//);
    expect(output).not.toMatch(/[A-Za-z]:\\/);
    expect(output).not.toMatch(/\/(?:home|tmp|var|etc|Users)\//);
    expect(output).not.toContain(BASE_URL);
    expect(output).toContain('RESULT READY');
  });

  describe('deliberately broken configurations', () => {
    it('1. missing transport credential → CONFIG-MISSING, zero requests', async () => {
      let calls = 0;
      const report = await runStartupPreflight(
        env({ IIPS_MARKET_DATA_TRANSPORT_TOKEN: undefined }),
        {
          fetchImpl: (async () => {
            calls += 1;
            throw new Error('unexpected request');
          }) as typeof fetch,
        },
      );

      expect(report.overall).toBe('NOT_READY');
      expect(statusMap(report)['transport-config']).toBe('CONFIG-MISSING');
      expect(Object.values(statusMap(report)).every((s) => s === 'CONFIG-MISSING')).toBe(true);
      expect(
        report.checks.find((c) => c.id === 'transport-config')?.detail,
      ).toContain('Transport configuration is absent');
      expect(calls).toBe(0);
    });

    it('2. non-loopback daemon address → FAIL at transport config, zero requests', async () => {
      let calls = 0;
      const report = await runStartupPreflight(
        env({ IIPS_MARKET_DATA_BASE_URL: 'http://10.0.0.5:8791' }),
        {
          fetchImpl: (async () => {
            calls += 1;
            throw new Error('unexpected request');
          }) as typeof fetch,
        },
      );

      expect(statusMap(report)['transport-config']).toBe('FAIL');
      expect(
        report.checks.find((c) => c.id === 'transport-config')?.detail,
      ).toContain('loopback HTTP endpoint');
      expect(calls).toBe(0);
    });

    it('3. unreachable daemon → FAIL only at reachability', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: (async () => {
          throw new Error('synthetic connection refusal');
        }) as typeof fetch,
      });

      expect(report.overall).toBe('NOT_READY');
      expect(statusMap(report)).toMatchObject({
        'transport-config': 'PASS',
        'daemon-reachable': 'FAIL',
        'token-auth': 'CONFIG-MISSING',
      });
      expect(
        report.checks.find((c) => c.id === 'daemon-reachable')?.detail,
      ).toContain('connection failed before an HTTP response');
    });

    it('4. rejected transport token → FAIL only at token authentication', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: jsonFetch(
          { error: { code: 'UNAUTHENTICATED', message: 'synthetic rejection' } },
          401,
        ),
      });

      expect(statusMap(report)).toMatchObject({
        'transport-config': 'PASS',
        'daemon-reachable': 'PASS',
        'token-auth': 'FAIL',
        'backend-active-ready': 'CONFIG-MISSING',
      });
      expect(report.checks.find((c) => c.id === 'token-auth')?.detail).toContain('HTTP 401');
      expect(formatPreflightReport(report)).not.toContain('synthetic rejection');
    });

    it('5. backend DOWN → FAIL only at backend active/ready', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: jsonFetch(diagnostics({ service: 'DOWN' })),
      });

      expect(statusMap(report)).toMatchObject({ ...ALL_PASS, 'backend-active-ready': 'FAIL' });
      expect(
        report.checks.find((c) => c.id === 'backend-active-ready')?.detail,
      ).toContain('service as DOWN');
    });

    it('6. zero instrument mappings → FAIL only at mapping count', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: jsonFetch(diagnostics({ qualifiedMappingsLoaded: 0 })),
      });

      expect(statusMap(report)).toMatchObject({ ...ALL_PASS, 'instrument-mappings': 'FAIL' });
      expect(
        report.checks.find((c) => c.id === 'instrument-mappings')?.detail,
      ).toContain('zero qualified instrument mappings');
    });

    it('7. expired token → FAIL only at expiry proximity', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: jsonFetch(diagnostics({ credentialResolutionOutcome: 'CREDENTIALS_EXPIRED' })),
      });

      expect(statusMap(report)).toMatchObject({ ...ALL_PASS, 'token-expiry': 'FAIL' });
      expect(report.checks.find((c) => c.id === 'token-expiry')?.detail).toContain(
        're-provisioning is required',
      );
    });

    it('8. unusable provider state → FAIL only at provider state', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: jsonFetch(diagnostics({ providerState: 'UNAVAILABLE' })),
      });

      expect(statusMap(report)).toMatchObject({ ...ALL_PASS, 'provider-state': 'FAIL' });
      expect(report.checks.find((c) => c.id === 'provider-state')?.detail).toContain(
        'provider is not ready for use',
      );
    });

    it('9. malformed diagnostics payload is attributed to the daemon, not the credential', async () => {
      const report = await runStartupPreflight(env(), {
        fetchImpl: jsonFetch({ notDiagnostics: true }),
      });

      expect(statusMap(report)).toMatchObject({
        'daemon-reachable': 'PASS',
        'token-auth': 'PASS',
        'backend-active-ready': 'CONFIG-MISSING',
      });
      expect(
        report.checks.find((c) => c.id === 'daemon-reachable')?.detail,
      ).toContain('fail-closed validator');
    });
  });
});
