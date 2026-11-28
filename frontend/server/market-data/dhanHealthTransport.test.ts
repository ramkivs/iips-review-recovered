/**
 * DHAN-P2 — health route tests (W-10: IPD authority only).
 *
 * These qualify the IRR-owned HTTP boundary: route mounting, method/path discipline, the
 * published envelope, the D-7 §8 mapping from IPD's provider state onto IRR's five states,
 * and the conservative handling of missing, unavailable and contradictory evidence.
 *
 * Pre-access, offline and synthetic: no Dhan credential is read, no socket to any vendor is
 * opened, and no IPD daemon other than a synthetic local fixture is contacted.
 */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DHAN_HEALTH_PATH,
  DHAN_HEALTH_PROVENANCE,
  DHAN_HEALTH_TRANSPORT_SEMANTICS,
  DHAN_VERIFY_CONNECTION_PATH,
  buildDhanHealthReportFromProbe,
  collectDhanDiagnosticsEvidence,
  handleDhanHealthRequest,
  isDhanHealthPath,
  isDhanVerifyConnectionPath,
  readIpdDiagnostics,
  type DhanDiagnosticsProbe,
} from './dhanHealthTransport';
import { classifyDhanHealth, isGovernedProviderState } from './dhanHealthState';
import { resolveIpdMarketDataTransportConfig, createIpdMarketDataTransportClient } from './dhanMarketDataTransport';
import type { ServiceDiagnostics } from 'iips-production-market-data/dhan-server';
import { SYNTHETIC_DIAGNOSTICS_FRESHNESS, SYNTHETIC_DIAGNOSTICS_PERSISTENCE } from './dhanSyntheticFixtures';

const FORBIDDEN_PAYLOAD_PATTERNS: readonly RegExp[] = [
  /vault:\/\//,
  /accessTokenKeyPath/i,
  /clientIdKeyPath/i,
  /secretRefPointers/i,
  /IIPS_DHAN_/,
  /IIPS_MARKET_DATA_TRANSPORT_TOKEN/,
  /Bearer\s/,
];

function expectNoProhibitedMarkers(serialized: string): void {
  for (const pattern of FORBIDDEN_PAYLOAD_PATTERNS) {
    expect(serialized).not.toMatch(pattern);
  }
}

/** A fully valid diagnostics payload; overrides tweak individual fields. */
function diagnosticsFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: 3,
    service: 'UP',
    providerState: 'CONFIGURED',
    providerConfiguration: 'CONFIGURED',
    providerReadiness: 'CREDENTIAL_REFERENCES_CONFIGURED',
    vaultBackendId: 'WINDOWS_DPAPI',
    liveCredentialResolutionSupported: true,
    vendorEgressMode: 'IPD_SERVER_HTTPS',
    credentialResolutionOutcome: 'CONFIGURED_NOT_RESOLVED',
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
      verificationProbes: 4,
      vendorRequestsTotal: 9,
      vendorSuccesses: 7,
      providerFailures: 1,
    },
    qualifiedMappingsLoaded: 12,
    quoteCache: { size: 2, capacity: 256, state: 'CURRENT', currentEntries: 2, staleEntries: 0, unavailableEntries: 0 },
    freshness: SYNTHETIC_DIAGNOSTICS_FRESHNESS,
    persistence: SYNTHETIC_DIAGNOSTICS_PERSISTENCE,
    ...overrides,
  };
}

interface SyntheticDaemon {
  readonly baseUrl: string;
  readonly requests: { method: string; path: string }[];
  close: () => Promise<void>;
}

/** Starts a synthetic IPD daemon that serves `body` as JSON and counts every request. */
async function startSyntheticDaemon(body: unknown, status = 200): Promise<SyntheticDaemon> {
  const requests: { method: string; path: string }[] = [];
  const server = http.createServer((req, res) => {
    requests.push({ method: req.method ?? '', path: (req.url ?? '').split('?')[0] });
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

function transportFor(baseUrl: string) {
  return {
    ok: true as const,
    config: { baseUrl, token: 'synthetic-token', timeoutMs: 2000, configured: true as const },
  };
}

/** Calls the IRR health route with injected deps and returns the parsed response. */
async function callHealth(
  transport?: ReturnType<typeof transportFor> | ReturnType<typeof resolveIpdMarketDataTransportConfig>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => {
    void handleDhanHealthRequest(req, res, { transport });
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${DHAN_HEALTH_PATH}`);
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('DHAN-P2 health route — path and method discipline', () => {
  it('serves exactly /api/dhan/health and nothing else', () => {
    expect(isDhanHealthPath('/api/dhan/health')).toBe(true);
    expect(isDhanHealthPath('/api/dhan/health?x=1')).toBe(true);
    expect(isDhanHealthPath('/api/dhan')).toBe(false);
    expect(isDhanHealthPath('/api/dhan/health/extra')).toBe(false);
    expect(isDhanHealthPath('/api/dhan/healthEVIL')).toBe(false);
    expect(isDhanHealthPath('/api/dhan/verify-connection')).toBe(false);
    expect(isDhanHealthPath(undefined)).toBe(false);
  });

  it('routes /api/dhan/verify-connection exactly, and nothing else', () => {
    expect(isDhanVerifyConnectionPath('/api/dhan/verify-connection')).toBe(true);
    expect(isDhanVerifyConnectionPath('/api/dhan/verify-connection?x=1')).toBe(true);
    expect(isDhanVerifyConnectionPath('/api/dhan/verify')).toBe(false);
    expect(isDhanVerifyConnectionPath('/api/dhan/health')).toBe(false);
    expect(isDhanVerifyConnectionPath('/api/dhan/verify-connectionEXTRA')).toBe(false);
    expect(isDhanVerifyConnectionPath(undefined)).toBe(false);
  });

  it('answers 404 for lookalike paths and unsupported methods', async () => {
    expect((await callHealth()).status).toBe(200); // unconfigured transport, still a 200 with UNAVAILABLE
    const server = http.createServer((req, res) => {
      void handleDhanHealthRequest(req, res, {});
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const wrongPath = await fetch(`http://127.0.0.1:${port}/api/dhan/health/extra`);
      expect(wrongPath.status).toBe(404);
      const wrongMethod = await fetch(`http://127.0.0.1:${port}${DHAN_HEALTH_PATH}`, { method: 'POST' });
      expect(wrongMethod.status).toBe(404);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe('DHAN-P2 health route — the published envelope', () => {
  it('publishes the report and the provenance block', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture());
    try {
      const response = await callHealth(transportFor(daemon.baseUrl));
      expect(response.status).toBe(200);

      const body = response.body as { data: Record<string, unknown>; provenance: Record<string, unknown> };
      expect(body.provenance).toEqual(DHAN_HEALTH_PROVENANCE);
      expect(body.provenance.authority).toBe('IPD');
      expect(body.provenance.transportSemantics).toBe(DHAN_HEALTH_TRANSPORT_SEMANTICS);

      // IPD reported CONFIGURED: references valid, no material read yet → PRE_ACCESS (D-7 §8).
      expect(body.data.state).toBe('PRE_ACCESS');
      expect(body.data.providerState).toBe('CONFIGURED');
      expect(body.data.providerConfiguration).toBe('CONFIGURED');
      expect(body.data.readiness).toBe('CREDENTIAL_REFERENCES_CONFIGURED');
      expect(body.data.credentialResolutionOutcome).toBe('CONFIGURED_NOT_RESOLVED');
      expect(body.data.configurationResolved).toBe(true);
      expect(body.data.transportReachable).toBe(true);
      expect(body.data.connectionAttempted).toBe(true);
      expect(body.data.vaultBackendId).toBe('WINDOWS_DPAPI');
      expect(body.data.vendorEgressMode).toBe('IPD_SERVER_HTTPS');
      expect(body.data.liveCredentialResolutionSupported).toBe(true);
      expect(body.data.qualifiedMappingsLoaded).toBe(12);
      expect(body.data.requestCounters).toMatchObject({ verificationProbes: 4, vendorRequestsTotal: 9 });
      expect(body.data.quoteCache).toMatchObject({ size: 2, state: 'CURRENT' });
      expect(daemon.requests).toEqual([{ method: 'GET', path: '/v1/diagnostics' }]);
    } finally {
      await daemon.close();
    }
  });

  it('never publishes a credential, a bearer token or a live claim', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture());
    try {
      const response = await callHealth(transportFor(daemon.baseUrl));
      const serialized = JSON.stringify(response.body);
      expectNoProhibitedMarkers(serialized);

      const data = (response.body as { data: Record<string, unknown> }).data;
      expect(data.liveProviderContacted).toBe(false);
      expect(data.liveQualified).toBe(false);
      expect(data.state).not.toBe('OPERATIONAL');
      expect(data.state).not.toBe('AUTHENTICATED');
    } finally {
      await daemon.close();
    }
  });

  it('discloses the phase boundary in the report', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture());
    try {
      const response = await callHealth(transportFor(daemon.baseUrl));
      const data = (response.body as { data: Record<string, unknown> }).data;
      const disclosure = String(data.disclosure);
      expect(disclosure).toContain('PRE-ACCESS');
      expect(disclosure).toContain('NOT live-qualified');
      expect(disclosure).toContain('not production readiness');
    } finally {
      await daemon.close();
    }
  });
});

describe('DHAN-P2 health route — the D-7 §8 mapping is total and verbatim', () => {
  const EXPECTED: ReadonlyArray<[string, string]> = [
    ['UNCONFIGURED', 'UNAVAILABLE'],
    ['CONFIGURED', 'PRE_ACCESS'],
    ['CREDENTIALS_RESOLVED', 'PRE_ACCESS'],
    ['AUTHENTICATED', 'AUTHENTICATED'],
    ['OPERATIONAL', 'OPERATIONAL'],
    ['EXPIRED', 'PRE_ACCESS'],
    ['DEGRADED', 'DISCONNECTED'],
    ['UNAVAILABLE', 'UNAVAILABLE'],
  ];

  it.each(EXPECTED)('IPD providerState %s maps to IRR %s', async (providerState, expected) => {
    const isLive = providerState === 'OPERATIONAL';
    const isAuth = providerState === 'AUTHENTICATED' || isLive;
    const daemon = await startSyntheticDaemon(
      diagnosticsFixture({
        providerState,
        providerConfiguration:
          providerState === 'UNCONFIGURED' ? 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' : 'CONFIGURED',
        providerReadiness:
          providerState === 'UNCONFIGURED'
            ? 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'
            : 'CREDENTIAL_REFERENCES_CONFIGURED',
        credentialResolutionOutcome:
          providerState === 'UNCONFIGURED'
            ? 'UNCONFIGURED'
            : providerState === 'EXPIRED'
              ? 'CREDENTIALS_EXPIRED'
              : 'CONFIGURED_NOT_RESOLVED',
        liveProviderConnectivity: isAuth ? 'CONNECTED_LIVE' : 'NOT_CHECKED_PRE_ACCESS',
        providerQualification: isLive ? 'LIVE_QUALIFIED' : 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        lastAuthOutcome: isAuth ? 'AUTHENTICATED' : 'NOT_CHECKED',
        lastSuccessAt: isAuth ? '2026-11-16T00:00:00.000Z' : null,
      }),
    );
    try {
      expect(isGovernedProviderState(providerState)).toBe(true);
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      const report = buildDhanHealthReportFromProbe(probe);
      expect(report.state).toBe(expected);
      expect(report.providerState).toBe(providerState);
      expect(daemon.requests).toHaveLength(1);
    } finally {
      await daemon.close();
    }
  });
});

describe('DHAN-P2 health route — fail-closed on degraded evidence', () => {
  it('reports UNAVAILABLE when the daemon never answered (no configuration evidence exists)', async () => {
    const response = await callHealth(transportFor('http://127.0.0.1:1'));
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.state).toBe('UNAVAILABLE');
    expect(data.transportReachable).toBe(false);
    expect(data.connectionAttempted).toBe(true);
    expect(data.providerState).toBeNull();
    // Never DISCONNECTED: there is no IPD evidence that the provider side is configured.
    expect(data.state).not.toBe('DISCONNECTED');
    expectNoProhibitedMarkers(JSON.stringify(response.body));
  });

  it('reports UNAVAILABLE when the transport is not configured, and claims nothing', async () => {
    const response = await callHealth(resolveIpdMarketDataTransportConfig({}));
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.state).toBe('UNAVAILABLE');
    expect(data.connectionAttempted).toBe(false);
    expect(data.transportReachable).toBe(false);
    expect(data.providerState).toBeNull();
    expect(String(data.reasons)).toContain('could not be read');
    expect(String(data.reasons)).toContain('No live provider capability is claimed.');
    expectNoProhibitedMarkers(JSON.stringify(response.body));
  });

  it('fails closed when the daemon answers with an ungoverned provider state', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture({ providerState: 'MOSTLY_CONFIGURED' }));
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      expect(probe.contractViolation).toBe(true);
      const report = buildDhanHealthReportFromProbe(probe);
      expect(report.state).toBe('UNAVAILABLE');
      expect(report.providerState).toBeNull();
      // Exactly one request — there is no retry path.
      expect(daemon.requests).toHaveLength(1);
    } finally {
      await daemon.close();
    }
  });

  it('fails closed when the daemon answers with an unsupported diagnostics contract version', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture({ contractVersion: 99 }));
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      expect(probe.contractViolation).toBe(true);
      const report = buildDhanHealthReportFromProbe(probe);
      expect(report.state).toBe('UNAVAILABLE');
      expect(daemon.requests).toHaveLength(1);
    } finally {
      await daemon.close();
    }
  });

  it('fails closed when the daemon answers with a cache whose parts do not sum to its size', async () => {
    const daemon = await startSyntheticDaemon(
      diagnosticsFixture({ quoteCache: { size: 5, capacity: 256, state: 'CURRENT', currentEntries: 1, staleEntries: 0, unavailableEntries: 0 } }),
    );
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      expect(probe.contractViolation).toBe(true);
      expect(buildDhanHealthReportFromProbe(probe).state).toBe('UNAVAILABLE');
    } finally {
      await daemon.close();
    }
  });

  it('fails closed when the body is not valid JSON', async () => {
    const daemon = await startSyntheticDaemon('this is not json');
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      expect(probe.contractViolation).toBe(true);
      expect(buildDhanHealthReportFromProbe(probe).state).toBe('UNAVAILABLE');
    } finally {
      await daemon.close();
    }
  });

  it('fails closed when the self-contradictory DOWN+OPERATIONAL payload is classified', async () => {
    const daemon = await startSyntheticDaemon(
      diagnosticsFixture({
        service: 'DOWN',
        providerState: 'OPERATIONAL',
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'LIVE_QUALIFIED',
      }),
    );
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      const report = buildDhanHealthReportFromProbe(probe);
      expect(report.state).toBe('UNAVAILABLE');
    } finally {
      await daemon.close();
    }
  });

  it('classifies an ungoverned providerState string injected directly into evidence as UNAVAILABLE', () => {
    expect(classifyDhanHealth({ providerState: 'TOTALLY_ONLINE' })).toBe('UNAVAILABLE');
  });

  it('does not promote the provider qualification in any state', async () => {
    for (const providerState of ['UNCONFIGURED', 'CONFIGURED', 'CREDENTIALS_RESOLVED', 'EXPIRED', 'DEGRADED', 'UNAVAILABLE']) {
      const daemon = await startSyntheticDaemon(
        diagnosticsFixture({
          providerState,
          providerConfiguration:
            providerState === 'UNCONFIGURED' ? 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE' : 'CONFIGURED',
          providerReadiness:
            providerState === 'UNCONFIGURED'
              ? 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE'
              : 'CREDENTIAL_REFERENCES_CONFIGURED',
        }),
      );
      try {
        const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
        const report = buildDhanHealthReportFromProbe(probe);
        expect(report.liveQualified).toBe(false);
        expect(report.liveProviderContacted).toBe(false);
        expect(report.state).not.toBe('AUTHENTICATED');
        expect(report.state).not.toBe('OPERATIONAL');
      } finally {
        await daemon.close();
      }
    }
  });
});

describe('DHAN-P2 health route — scope refusals', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const transportSource = readFileSync(resolve(here, 'dhanHealthTransport.ts'), 'utf8');
  const stateSource = readFileSync(resolve(here, 'dhanHealthState.ts'), 'utf8');
  const executiveSource = readFileSync(resolve(here, '..', 'executive-transport.ts'), 'utf8');

  it('is process-level status and is deliberately NOT owner-scoped', () => {
    const ownerScopedBlock = executiveSource.slice(
      executiveSource.indexOf('const OWNER_SCOPED_API_PREFIXES'),
      executiveSource.indexOf('] as const);'),
    );
    expect(ownerScopedBlock).not.toContain('/api/dhan');
    // The routes ARE mounted in the active dispatcher.
    expect(executiveSource).toContain("dhanHealthPath === '/api/dhan/health'");
    expect(executiveSource).toContain('/api/dhan/verify-connection');
    expect(executiveSource).toContain("import('./market-data/dhanHealthTransport')");
  });

  it('is server-side only: the deleted env-resolution module stays deleted', () => {
    // The pre-W-10 boundary (`dhanMarketDataRoute.ts`) re-derived IPD provider configuration
    // from IRR's own `IIPS_DHAN_*` environment — the second source of truth B-6 forbids.
    // W-10 removes it; this assertion fails if it ever returns.
    expect(existsSync(resolve(here, 'dhanMarketDataRoute.ts'))).toBe(false);
    expect(transportSource).not.toContain('dhanMarketDataRoute');
    expect(transportSource).toContain("from './dhanMarketDataTransport'");
    expect(transportSource).toContain("from './dhanHealthState'");
  });

  it('reads no ambient process.env inside the transport module', () => {
    expect(transportSource).not.toMatch(/process\.env/);
  });

  it('carries no IIPS_DHAN_ reference, no SecretRef pointer field and no vault:// in any IRR source', () => {
    for (const source of [transportSource, stateSource]) {
      expect(source).not.toMatch(/IIPS_DHAN_/);
      expect(source).not.toMatch(/secretRefPointers/i);
      expect(source).not.toMatch(/vault:\/\//);
      expect(source).not.toMatch(/accessTokenKeyPath/i);
      expect(source).not.toMatch(/clientIdKeyPath/i);
      expect(source).not.toMatch(/missingKeys/);
    }
  });

  it('does not construct a provider client, a credential resolver or a market-data service', () => {
    expect(transportSource).not.toMatch(/new\s+DhanApiClient\s*\(/);
    expect(transportSource).not.toMatch(/DhanMarketDataService/);
    expect(transportSource).not.toMatch(/LocalHostVaultDhanCredentialResolver/);
    // The health route does not construct the transport client either: it delegates to the
    // shared composition module, which owns the single construction site.
    expect(transportSource).not.toMatch(/new\s+MarketDataTransportClient\s*\(/);
  });

  it('issues exactly one diagnostics request per route invocation by construction', () => {
    // There is exactly one call site of `client.diagnostics()` in the module and no retry
    // path anywhere: the single-request property is structural, and the synthetic-daemon
    // tests prove it end to end.
    const callSites = transportSource.match(/client\.diagnostics\(\)/g) ?? [];
    expect(callSites).toHaveLength(1);
    expect(transportSource).not.toMatch(/retr(y|ies)\(/);
    expect(transportSource).not.toMatch(/setInterval|setTimeout/);
  });

  it('issues exactly one verification request per operator action by construction', () => {
    // There is exactly one call site of `client.verifyConnection()` in the module and no
    // retry path anywhere: the single-request property is structural, and the
    // synthetic-daemon tests prove it end to end.
    const callSites = transportSource.match(/client\.verifyConnection\(/g) ?? [];
    expect(callSites).toHaveLength(1);
    // IRR never constructs a second verifier and never calls the vendor itself.
    expect(transportSource).not.toMatch(/new\s+DhanApiClient\s*\(/);
    expect(transportSource).not.toMatch(/verifyProviderConnection/);
    expect(transportSource).not.toMatch(/retr(y|ies)\(/);
    expect(transportSource).not.toMatch(/setInterval|setTimeout/);
  });

  it('the pinned IPD contract exposes the W-09 diagnostics client and the W-10 verify operation', () => {
    expect(typeof createIpdMarketDataTransportClient).toBe('function');
    const client = createIpdMarketDataTransportClient({
      baseUrl: 'http://127.0.0.1:8791',
      token: 'synthetic-token',
      timeoutMs: 1000,
      configured: true,
    });
    expect(typeof (client as { diagnostics?: unknown }).diagnostics).toBe('function');
    expect(typeof (client as { verifyConnection?: unknown }).verifyConnection).toBe('function');
  });
});

describe('DHAN-P2 health route — the transport diagnostics read', () => {
  it('reports a reachable daemon with IPD own authoritative diagnostics', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture({ providerState: 'CREDENTIALS_RESOLVED', credentialResolutionOutcome: 'CREDENTIALS_RESOLVED' }));
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      expect(probe.attempted).toBe(true);
      expect(probe.reachable).toBe(true);
      expect(probe.diagnostics?.providerState).toBe('CREDENTIALS_RESOLVED');
      expect(daemon.requests).toEqual([{ method: 'GET', path: '/v1/diagnostics' }]);
    } finally {
      await daemon.close();
    }
  });

  it('reports an attempted-but-failed diagnostics read as attempted, never upgraded', async () => {
    const probe = await readIpdDiagnostics({
      transport: transportFor('http://127.0.0.1:1'),
    });
    expect(probe.attempted).toBe(true);
    expect(probe.reachable).toBe(false);
    expect(probe.diagnostics).toBeUndefined();
  });

  it('reports an unconfigured transport as NOT attempted', async () => {
    const probe = await readIpdDiagnostics({ transport: resolveIpdMarketDataTransportConfig({}) });
    expect(probe.attempted).toBe(false);
    expect(probe.reachable).toBe(false);
  });

  it('carries a MALFORMED_RESPONSE failure (unreachable-to-parse daemon) as a contract violation', async () => {
    const daemon = await startSyntheticDaemon({ ok: false, failure: { code: 'REQUEST_TIMEOUT', message: 'slow' } }, 504);
    try {
      const probe = await readIpdDiagnostics({ transport: transportFor(daemon.baseUrl) });
      // Non-2xx with an error envelope: IPD's client surfaces the daemon's code, not MALFORMED_RESPONSE.
      // Either way, no usable payload is produced and the classifier will not upgrade anything.
      expect(probe.reachable).toBe(false);
      expect(probe.contractViolation).toBeUndefined();
      expect(buildDhanHealthReportFromProbe(probe).state).toBe('UNAVAILABLE');
    } finally {
      await daemon.close();
    }
  });
});
