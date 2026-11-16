/**
 * W-10 — operator-initiated "Verify connection" route tests.
 *
 * The action is operator-initiated only, single-shot, and read-only: exactly one
 * `/v1/diagnostics` request is issued to the local IPD daemon (zero when the transport is
 * not configured), with no retry, no loop, no credential resolution and no vendor call.
 * These tests prove those properties end to end against a synthetic daemon that counts
 * every request it receives.
 *
 * Pre-access, offline and synthetic: no Dhan credential is read, no socket to any vendor is
 * opened, and no IPD daemon other than a synthetic local fixture is contacted.
 */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  DHAN_VERIFY_CONNECTION_PATH,
  DHAN_VERIFY_CONNECTION_NOTE,
  DHAN_VERIFY_CONNECTION_PROVENANCE,
  DHAN_VERIFY_CONNECTION_TRANSPORT_SEMANTICS,
  handleDhanVerifyConnectionRequest,
} from './dhanHealthTransport';
import { resolveIpdMarketDataTransportConfig } from './dhanMarketDataTransport';

const FORBIDDEN_PAYLOAD_PATTERNS: readonly RegExp[] = [
  /vault:\/\//,
  /accessTokenKeyPath/i,
  /clientIdKeyPath/i,
  /secretRefPointers/i,
  /IIPS_DHAN_/,
  /IIPS_MARKET_DATA_TRANSPORT_TOKEN/,
  /Bearer\s/,
];

function diagnosticsFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: 1,
    service: 'UP',
    providerState: 'CONFIGURED',
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
    lastAuthOutcome: 'AUTHENTICATED',
    lastLatencyMs: 87,
    consecutiveAuthFailures: 0,
    authLatched: false,
    requestCounters: {
      quoteRequests: 11,
      quoteCacheHits: 6,
      historicalRequests: 2,
      verificationProbes: 3,
      vendorRequestsTotal: 30,
      vendorSuccesses: 28,
      providerFailures: 1,
    },
    qualifiedMappingsLoaded: 21,
    quoteCache: { size: 4, capacity: 256, state: 'CURRENT', currentEntries: 4, staleEntries: 0, unavailableEntries: 0 },
    ...overrides,
  };
}

interface SyntheticDaemon {
  readonly baseUrl: string;
  readonly requests: { method: string; path: string }[];
  close: () => Promise<void>;
}

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

async function callVerify(
  method: string,
  transport?: ReturnType<typeof transportFor> | ReturnType<typeof resolveIpdMarketDataTransportConfig>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => {
    void handleDhanVerifyConnectionRequest(req, res, { transport });
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${DHAN_VERIFY_CONNECTION_PATH}`, { method });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('W-10 verify-connection route — path and method discipline', () => {
  it('answers only POST on exactly /api/dhan/verify-connection', async () => {
    expect((await callVerify('GET')).status).toBe(404);
    expect((await callVerify('PUT')).status).toBe(404);
    expect((await callVerify('DELETE')).status).toBe(404);
    expect((await callVerify('POST')).status).toBe(200);
  });
});

describe('W-10 verify-connection route — exactly one request, always', () => {
  it('issues exactly one /v1/diagnostics GET when the transport is configured', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture());
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(response.status).toBe(200);
      // Exactly one request, and it is the approved observation read — nothing else.
      expect(daemon.requests).toEqual([{ method: 'GET', path: '/v1/diagnostics' }]);
    } finally {
      await daemon.close();
    }
  });

  it('issues zero requests when the transport is not configured — never a blind probe', async () => {
    const response = await callVerify('POST', resolveIpdMarketDataTransportConfig({}));
    expect(response.status).toBe(200);
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.attempted).toBe(false);
    expect(data.requestsIssued).toBe(0);
    expect(data.outcome).toBe('NOT_ATTEMPTED_NOT_CONFIGURED');
    expect(data.state).toBe('UNAVAILABLE');
    expect(data.providerState).toBeNull();
  });

  it('issues exactly one request even when the daemon does not answer', async () => {
    const response = await callVerify('POST', transportFor('http://127.0.0.1:1'));
    expect(response.status).toBe(200);
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.attempted).toBe(true);
    expect(data.requestsIssued).toBe(1);
    expect(data.outcome).toBe('TRANSPORT_UNAVAILABLE');
    expect(data.state).toBe('UNAVAILABLE');
    expect(data.providerState).toBeNull();
  });

  it('issues exactly one request even when the daemon answers with a contract violation', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture({ providerState: 'TOTALLY_ONLINE' }));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(response.status).toBe(200);
      expect(daemon.requests).toEqual([{ method: 'GET', path: '/v1/diagnostics' }]);
      const data = (response.body as { data: Record<string, unknown> }).data;
      expect(data.requestsIssued).toBe(1);
      expect(data.outcome).toBe('DIAGNOSTICS_CONTRACT_VIOLATION');
      expect(data.state).toBe('UNAVAILABLE');
      expect(data.providerState).toBeNull();
    } finally {
      await daemon.close();
    }
  });
});

describe('W-10 verify-connection route — the published report', () => {
  it('maps IPD CONFIGURED onto PRE_ACCESS and echoes the enumerated evidence', async () => {
    const daemon = await startSyntheticDaemon(diagnosticsFixture());
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const body = response.body as { data: Record<string, unknown>; provenance: Record<string, unknown> };
      const data = body.data;

      expect(body.provenance).toEqual(DHAN_VERIFY_CONNECTION_PROVENANCE);
      expect(body.provenance.authority).toBe('IPD');
      expect(body.provenance.transportSemantics).toBe(DHAN_VERIFY_CONNECTION_TRANSPORT_SEMANTICS);

      expect(data.action).toBe('VERIFY_CONNECTION');
      expect(data.outcome).toBe('OBSERVED');
      expect(data.requestsIssued).toBe(1);
      expect(data.state).toBe('PRE_ACCESS');
      expect(data.providerState).toBe('CONFIGURED');
      expect(data.credentialResolutionOutcome).toBe('CREDENTIALS_RESOLVED');
      expect(data.lastAuthOutcome).toBe('AUTHENTICATED');
      expect(data.lastLatencyMs).toBe(87);
      expect(data.requestCounters).toMatchObject({ verificationProbes: 3, vendorRequestsTotal: 30 });
      expect(data.qualifiedMappingsLoaded).toBe(21);
      expect(data.vaultBackendId).toBe('WINDOWS_DPAPI');
      expect(data.vendorEgressMode).toBe('IPD_SERVER_HTTPS');
      expect(data.liveProviderConnectivity).toBe('NOT_CHECKED_PRE_ACCESS');
      expect(data.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
      // This action performed no vendor verification: it observes IPD's recorded state.
      expect(data.liveProviderContacted).toBe(false);
      expect(String(data.verificationNote)).toBe(DHAN_VERIFY_CONNECTION_NOTE);
      expect(String(data.verificationNote)).toContain('does not itself authenticate to the vendor');
      expect(String(data.checkedAt)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    } finally {
      await daemon.close();
    }
  });

  it('maps IPD DEGRADED onto DISCONNECTED, with the failure category echoed', async () => {
    const daemon = await startSyntheticDaemon(
      diagnosticsFixture({ providerState: 'DEGRADED', lastFailureCategory: 'AUTHENTICATION_FAILURE', lastFailure: { category: 'AUTHENTICATION_FAILURE', at: '2026-11-16T00:00:00.000Z' }, authLatched: true, consecutiveAuthFailures: 2 }),
    );
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = (response.body as { data: Record<string, unknown> }).data;
      expect(data.outcome).toBe('OBSERVED');
      expect(data.state).toBe('DISCONNECTED');
      expect(data.providerState).toBe('DEGRADED');
      expect(data.lastFailureCategory).toBe('AUTHENTICATION_FAILURE');
      expect(data.authLatched).toBe(true);
    } finally {
      await daemon.close();
    }
  });

  it('publishes no credential, pointer, path or bearer prefix — in any outcome', async () => {
    const scenarios: ReadonlyArray<{ label: string; daemon?: { body: unknown; status?: number } }> = [
      { label: 'observed', daemon: { body: diagnosticsFixture() } },
      { label: 'contract-violation', daemon: { body: diagnosticsFixture({ providerState: 'TOTALLY_ONLINE' }) } },
      { label: 'non-2xx', daemon: { body: { error: { code: 'REQUEST_TIMEOUT', message: 'slow' } }, status: 504 } },
      { label: 'not json', daemon: { body: 'not json at all' } },
      { label: 'configured with full secrets-adjacent fixture', daemon: { body: diagnosticsFixture({ vaultBackendId: 'WINDOWS_DPAPI' }) } },
    ];
    for (const scenario of scenarios) {
      const daemon = scenario.daemon ? await startSyntheticDaemon(scenario.daemon.body, scenario.daemon.status ?? 200) : null;
      try {
        const response = await callVerify('POST', daemon ? transportFor(daemon.baseUrl) : transportFor('http://127.0.0.1:1'));
        const serialized = JSON.stringify(response.body);
        for (const pattern of FORBIDDEN_PAYLOAD_PATTERNS) {
          expect(serialized, `${scenario.label} must match ${String(pattern)}`).not.toMatch(pattern);
        }
      } finally {
        await daemon?.close();
      }
    }
  });
});
