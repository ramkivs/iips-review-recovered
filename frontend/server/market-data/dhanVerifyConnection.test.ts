/**
 * W-10 — operator-initiated "Verify connection" route tests.
 *
 * The action is operator-initiated only, single-shot, and delegates to IPD's governed
 * connection-verification operation: exactly one `POST /v1/connection/verify` is issued to
 * the local IPD daemon (zero when the transport is not configured), with no retry, no loop,
 * no credential resolution by IRR and no IRR-side verification of any kind. These tests
 * prove those properties end to end against a synthetic daemon that counts every request it
 * receives, and that the D-7 §3 verification contract is carried verbatim and validated
 * fail-closed.
 *
 * Pre-access, offline and synthetic: no Dhan credential is read, no socket to any vendor is
 * opened, and no IPD daemon other than a synthetic local fixture is contacted.
 */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  DHAN_VERIFY_CONNECTION_PATH,
  DHAN_VERIFY_CONNECTION_PROVENANCE,
  DHAN_VERIFY_CONNECTION_TRANSPORT_SEMANTICS,
  handleDhanVerifyConnectionRequest,
  verificationNoteFor,
} from './dhanHealthTransport';
import { resolveIpdMarketDataTransportConfig } from './dhanMarketDataTransport';
import { SYNTHETIC_DIAGNOSTICS_FRESHNESS, SYNTHETIC_DIAGNOSTICS_PERSISTENCE } from './dhanSyntheticFixtures';

const FORBIDDEN_PAYLOAD_PATTERNS: readonly RegExp[] = [
  /vault:\/\//,
  /accessTokenKeyPath/i,
  /clientIdKeyPath/i,
  /secretRefPointers/i,
  /IIPS_DHAN_/,
  /IIPS_MARKET_DATA_TRANSPORT_TOKEN/,
  /Bearer\s/,
  /Vx8mKpSecretAccessTok/i,
  /ClntSecretId/i,
];

function diagnosticsFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: 3,
    service: 'UP',
    providerState: 'CREDENTIALS_RESOLVED',
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
    freshness: SYNTHETIC_DIAGNOSTICS_FRESHNESS,
    persistence: SYNTHETIC_DIAGNOSTICS_PERSISTENCE,
    ...overrides,
  };
}

function observedStateFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    lastSuccessAt: null,
    lastFailure: null,
    lastAuthOutcome: 'NOT_CHECKED',
    lastLatencyMs: null,
    consecutiveAuthFailures: 0,
    authLatched: false,
    ...overrides,
  };
}

/** A verification payload that passes IPD's own `validateDhanConnectionVerification`. */
function verificationFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const diagnostics = (overrides.diagnostics ??
    diagnosticsFixture()) as Record<string, unknown>;
  const base: Record<string, unknown> = {
    contractVersion: 1,
    mode: 'LIVE_PROBE',
    outcome: 'VERIFIED_LOCAL_ONLY',
    providerState: diagnostics.providerState,
    localReadinessEstablished: true,
    probeAttempted: false,
    probeCount: 0,
    failureCategory: null,
    checkedAt: '2026-11-16T00:00:00.000Z',
    latencyMs: null,
    observedState: observedStateFixture(),
    diagnostics,
    ...overrides,
  };
  return base;
}

/** Vendor-authenticated fixture: exactly one probe, vendor accepted, AUTHENTICATED. */
function vendorVerifiedFixture(): Record<string, unknown> {
  const diagnostics = diagnosticsFixture({
    providerState: 'AUTHENTICATED',
    liveProviderConnectivity: 'CONNECTED_LIVE',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    lastSuccessAt: '2026-11-16T00:00:00.000Z',
    lastAuthOutcome: 'AUTHENTICATED',
    lastLatencyMs: 42,
  });
  return verificationFixture({
    mode: 'LIVE_PROBE',
    outcome: 'VERIFIED_VENDOR_ACCEPTED',
    providerState: 'AUTHENTICATED',
    localReadinessEstablished: true,
    probeAttempted: true,
    probeCount: 1,
    failureCategory: null,
    latencyMs: 42,
    observedState: observedStateFixture({
      lastSuccessAt: '2026-11-16T00:00:00.000Z',
      lastAuthOutcome: 'AUTHENTICATED',
      lastLatencyMs: 42,
    }),
    diagnostics,
  });
}

interface SyntheticDaemon {
  readonly baseUrl: string;
  readonly requests: { method: string; path: string; body: string }[];
  close: () => Promise<void>;
}

async function startSyntheticDaemon(
  handler: (body: string) => { status: number; body: unknown },
): Promise<SyntheticDaemon> {
  const requests: { method: string; path: string; body: string }[] = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ method: req.method ?? '', path: (req.url ?? '').split('?')[0], body });
      const { status, body: responseBody } = handler(body);
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

function staticDaemon(status: number, body: unknown) {
  return () => ({ status, body });
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

function dataOf(body: Record<string, unknown>): Record<string, unknown> {
  return body.data as Record<string, unknown>;
}

describe('W-10 verify-connection route — path and method discipline', () => {
  it('answers only POST on exactly /api/dhan/verify-connection', async () => {
    expect((await callVerify('GET')).status).toBe(404);
    expect((await callVerify('PUT')).status).toBe(404);
    expect((await callVerify('DELETE')).status).toBe(404);
    expect((await callVerify('POST')).status).toBe(200);
  });
});

describe('W-10 verify-connection route — exactly one verification request, always', () => {
  it('issues exactly one POST /v1/connection/verify when the transport is configured', async () => {
    const daemon = await startSyntheticDaemon(staticDaemon(200, verificationFixture()));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(response.status).toBe(200);
      // Exactly one request, and it is the governed verification operation — nothing else.
      expect(daemon.requests).toEqual([{ method: 'POST', path: '/v1/connection/verify', body: '{}' }]);
    } finally {
      await daemon.close();
    }
  });

  it('issues zero requests when the transport is not configured — never a blind verification', async () => {
    const response = await callVerify('POST', resolveIpdMarketDataTransportConfig({}));
    expect(response.status).toBe(200);
    const data = dataOf(response.body);
    expect(data.attempted).toBe(false);
    expect(data.requestsIssued).toBe(0);
    expect(data.outcome).toBe('NOT_ATTEMPTED_NOT_CONFIGURED');
    expect(data.state).toBe('UNAVAILABLE');
    expect(data.providerState).toBeNull();
    expect(data.verification).toBeNull();
    expect(data.liveProviderContacted).toBe(false);
  });

  it('issues exactly one request even when the daemon does not answer', async () => {
    const response = await callVerify('POST', transportFor('http://127.0.0.1:1'));
    expect(response.status).toBe(200);
    const data = dataOf(response.body);
    expect(data.attempted).toBe(true);
    expect(data.requestsIssued).toBe(1);
    expect(data.outcome).toBe('TRANSPORT_UNAVAILABLE');
    expect(data.state).toBe('UNAVAILABLE');
    expect(data.providerState).toBeNull();
    expect(data.verification).toBeNull();
    expect(data.liveProviderContacted).toBe(false);
    expect(typeof data.failureCode).toBe('string');
  });

  it('issues exactly one request when the daemon answers with a payload violating the contract', async () => {
    const daemon = await startSyntheticDaemon(staticDaemon(200, verificationFixture({ providerState: 'TOTALLY_ONLINE' })));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(response.status).toBe(200);
      expect(daemon.requests).toHaveLength(1);
      const data = dataOf(response.body);
      expect(data.requestsIssued).toBe(1);
      expect(data.outcome).toBe('VERIFICATION_CONTRACT_VIOLATION');
      expect(data.state).toBe('UNAVAILABLE');
      expect(data.providerState).toBeNull();
      expect(data.verification).toBeNull();
      expect(data.liveProviderContacted).toBe(false);
    } finally {
      await daemon.close();
    }
  });

  it('never retries: one click, one request, even when the daemon answers 500', async () => {
    const daemon = await startSyntheticDaemon(staticDaemon(500, { error: { code: 'REQUEST_TIMEOUT', message: 'slow' } }));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(response.status).toBe(200);
      expect(daemon.requests).toHaveLength(1);
      const data = dataOf(response.body);
      expect(data.outcome).toBe('TRANSPORT_UNAVAILABLE');
      expect(data.requestsIssued).toBe(1);
    } finally {
      await daemon.close();
    }
  });
});

describe('W-10 verify-connection route — IPD D-7 §3 verdicts carried verbatim', () => {
  it('VERIFIED_LOCAL_ONLY is local readiness only — never vendor authentication', async () => {
    const daemon = await startSyntheticDaemon(staticDaemon(200, verificationFixture()));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(daemon.requests).toHaveLength(1);
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      expect(data.state).toBe('PRE_ACCESS');
      expect(data.providerState).toBe('CREDENTIALS_RESOLVED');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('VERIFIED_LOCAL_ONLY');
      expect(verification.probeAttempted).toBe(false);
      expect(verification.probeCount).toBe(0);
      expect(verification.localReadinessEstablished).toBe(true);
      expect(verification.mode).toBe('LIVE_PROBE');
      // The honesty flag reflects IPD's validated payload: the vendor was NOT contacted.
      expect(data.liveProviderContacted).toBe(false);
      expect(String(data.verificationNote)).toContain('NOT authentication to the vendor');
      expect(String(data.verificationNote)).toContain('WITHOUT contacting the vendor');
    } finally {
      await daemon.close();
    }
  });

  it('VERIFIED_VENDOR_ACCEPTED is surfaced accurately — vendor accepted, one probe', async () => {
    const daemon = await startSyntheticDaemon(staticDaemon(200, vendorVerifiedFixture()));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      expect(daemon.requests).toHaveLength(1);
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      expect(data.state).toBe('AUTHENTICATED');
      expect(data.providerState).toBe('AUTHENTICATED');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('VERIFIED_VENDOR_ACCEPTED');
      expect(verification.probeAttempted).toBe(true);
      expect(verification.probeCount).toBe(1);
      expect(verification.latencyMs).toBe(42);
      expect(data.liveProviderContacted).toBe(true);
      expect(String(data.verificationNote)).toContain('vendor accepted authentication');
      // Not live-qualified merely because the vendor accepted: the axes stay separate.
      expect(data.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    } finally {
      await daemon.close();
    }
  });

  it('AUTH_REJECTED maps onto DISCONNECTED with the failure category echoed', async () => {
    const diagnostics = diagnosticsFixture({
      providerState: 'DEGRADED',
      lastFailureCategory: 'AUTHENTICATION_FAILURE',
      lastFailure: { category: 'AUTHENTICATION_FAILURE', at: '2026-11-16T00:00:00.000Z' },
      lastAuthOutcome: 'AUTHENTICATION_FAILURE',
      consecutiveAuthFailures: 2,
      authLatched: true,
    });
    const fixture = verificationFixture({
      outcome: 'AUTH_REJECTED',
      providerState: 'DEGRADED',
      localReadinessEstablished: true,
      probeAttempted: true,
      probeCount: 1,
      failureCategory: 'AUTHENTICATION_FAILURE',
      latencyMs: 30,
      observedState: observedStateFixture({
        lastFailure: { category: 'AUTHENTICATION_FAILURE', at: '2026-11-16T00:00:00.000Z' },
        lastAuthOutcome: 'AUTHENTICATION_FAILURE',
        lastLatencyMs: 30,
        consecutiveAuthFailures: 2,
        authLatched: true,
      }),
      diagnostics,
    });
    const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      expect(data.state).toBe('DISCONNECTED');
      expect(data.providerState).toBe('DEGRADED');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('AUTH_REJECTED');
      expect(verification.failureCategory).toBe('AUTHENTICATION_FAILURE');
      expect(data.liveProviderContacted).toBe(true);
      expect(data.authLatched).toBe(true);
    } finally {
      await daemon.close();
    }
  });

  it('EXPIRED_LOCAL is a local determination — vendor not contacted, PRE_ACCESS', async () => {
    const diagnostics = diagnosticsFixture({
      providerState: 'EXPIRED',
      credentialResolutionOutcome: 'CREDENTIALS_EXPIRED',
      lastAuthOutcome: 'CREDENTIALS_EXPIRED',
    });
    const fixture = verificationFixture({
      outcome: 'EXPIRED_LOCAL',
      providerState: 'EXPIRED',
      localReadinessEstablished: false,
      probeAttempted: false,
      probeCount: 0,
      failureCategory: 'CREDENTIALS_EXPIRED',
      latencyMs: null,
      observedState: observedStateFixture({ lastAuthOutcome: 'CREDENTIALS_EXPIRED' }),
      diagnostics,
    });
    const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      expect(data.state).toBe('PRE_ACCESS');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('EXPIRED_LOCAL');
      expect(verification.localReadinessEstablished).toBe(false);
      expect(data.liveProviderContacted).toBe(false);
    } finally {
      await daemon.close();
    }
  });

  it('FAILED_TRANSPORT is surfaced honestly — one probe attempted, none authenticated', async () => {
    const diagnostics = diagnosticsFixture({
      providerState: 'DEGRADED',
      lastFailureCategory: 'TRANSPORT_FAILURE',
      lastFailure: { category: 'TRANSPORT_FAILURE', at: '2026-11-16T00:00:00.000Z' },
    });
    const fixture = verificationFixture({
      outcome: 'FAILED_TRANSPORT',
      providerState: 'DEGRADED',
      localReadinessEstablished: true,
      probeAttempted: true,
      probeCount: 1,
      failureCategory: 'TRANSPORT_FAILURE',
      latencyMs: 1500,
      observedState: observedStateFixture({
        lastFailure: { category: 'TRANSPORT_FAILURE', at: '2026-11-16T00:00:00.000Z' },
        lastLatencyMs: 1500,
      }),
      diagnostics,
    });
    const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      expect(data.state).toBe('DISCONNECTED');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('FAILED_TRANSPORT');
      expect(verification.probeCount).toBe(1);
      expect(data.liveProviderContacted).toBe(true);
      expect(String(data.verificationNote)).toContain('transport failed');
    } finally {
      await daemon.close();
    }
  });

  it('FAILED_VENDOR_RESPONSE is surfaced honestly — probe issued, response unacceptable', async () => {
    const diagnostics = diagnosticsFixture({
      providerState: 'DEGRADED',
      lastFailureCategory: 'PROVIDER_STATUS_FAILURE',
      lastFailure: { category: 'PROVIDER_STATUS_FAILURE', at: '2026-11-16T00:00:00.000Z' },
    });
    const fixture = verificationFixture({
      outcome: 'FAILED_VENDOR_RESPONSE',
      providerState: 'DEGRADED',
      localReadinessEstablished: true,
      probeAttempted: true,
      probeCount: 1,
      failureCategory: 'PROVIDER_STATUS_FAILURE',
      latencyMs: 87,
      observedState: observedStateFixture({
        lastFailure: { category: 'PROVIDER_STATUS_FAILURE', at: '2026-11-16T00:00:00.000Z' },
        lastLatencyMs: 87,
      }),
      diagnostics,
    });
    const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('FAILED_VENDOR_RESPONSE');
      expect(data.liveProviderContacted).toBe(true);
    } finally {
      await daemon.close();
    }
  });

  it('NOT_ATTEMPTED_NOT_READY is surfaced honestly — nothing attempted, nothing claimed', async () => {
    const diagnostics = diagnosticsFixture({
      providerState: 'UNCONFIGURED',
      providerConfiguration: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
      readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
      credentialResolutionOutcome: 'UNCONFIGURED',
      liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    });
    const fixture = verificationFixture({
      outcome: 'NOT_ATTEMPTED_NOT_READY',
      providerState: 'UNCONFIGURED',
      localReadinessEstablished: false,
      probeAttempted: false,
      probeCount: 0,
      failureCategory: 'CREDENTIALS_UNAVAILABLE',
      latencyMs: null,
      diagnostics,
    });
    const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = dataOf(response.body);
      expect(data.outcome).toBe('EXECUTED');
      expect(data.state).toBe('UNAVAILABLE');
      const verification = data.verification as Record<string, unknown>;
      expect(verification.outcome).toBe('NOT_ATTEMPTED_NOT_READY');
      expect(verification.probeAttempted).toBe(false);
      expect(data.liveProviderContacted).toBe(false);
    } finally {
      await daemon.close();
    }
  });
});

describe('W-10 verify-connection route — fail-closed validation of the wire contract', () => {
  const violatingPayloads: ReadonlyArray<{ label: string; mutate: (f: Record<string, unknown>) => void }> = [
    { label: 'unknown outcome', mutate: (f) => { f.outcome = 'SOMETIMES_LIVE'; } },
    { label: 'unknown mode', mutate: (f) => { f.mode = 'PROBE_FOREVER'; } },
    { label: 'contract version 2', mutate: (f) => { f.contractVersion = 2; } },
    { label: 'probe count mismatch', mutate: (f) => { f.probeAttempted = true; f.probeCount = 0; } },
    { label: 'LOCAL_ONLY with a probe', mutate: (f) => { f.mode = 'LOCAL_ONLY'; f.probeAttempted = true; f.probeCount = 1; } },
    { label: 'local-only readiness misrepresented as AUTHENTICATED with null lastSuccessAt', mutate: (f) => {
        f.outcome = 'VERIFIED_LOCAL_ONLY';
        f.providerState = 'AUTHENTICATED';
        f.diagnostics = diagnosticsFixture({ providerState: 'AUTHENTICATED', liveProviderConnectivity: 'CONNECTED_LIVE' });
      } },
    { label: 'failure category on a clean success', mutate: (f) => {
        f.outcome = 'VERIFIED_VENDOR_ACCEPTED';
        f.mode = 'LIVE_PROBE';
        f.probeAttempted = true;
        f.probeCount = 1;
        f.failureCategory = 'TRANSPORT_FAILURE';
        f.providerState = 'AUTHENTICATED';
        f.diagnostics = diagnosticsFixture({ providerState: 'AUTHENTICATED' });
      } },
    { label: 'latency on an unattempted probe', mutate: (f) => { f.latencyMs = 12; } },
  ];

  for (const { label, mutate } of violatingPayloads) {
    it(`rejects fail-closed: ${label}`, async () => {
      const fixture = verificationFixture();
      mutate(fixture);
      const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
      try {
        const response = await callVerify('POST', transportFor(daemon.baseUrl));
        expect(response.status).toBe(200);
        expect(daemon.requests).toHaveLength(1);
        const data = dataOf(response.body);
        expect(data.outcome).toBe('VERIFICATION_CONTRACT_VIOLATION');
        expect(data.verification).toBeNull();
        expect(data.state).toBe('UNAVAILABLE');
        expect(data.providerState).toBeNull();
      } finally {
        await daemon.close();
      }
    });
  }

  it('rejects a contradictory payload even when field names are exactly right', async () => {
    // VERIFIED_VENDOR_ACCEPTED without a probe is contradictory (D-7 §3) and must not be
    // surfaced as authenticated by any path.
    const fixture = verificationFixture({
      outcome: 'VERIFIED_VENDOR_ACCEPTED',
      mode: 'LIVE_PROBE',
      localReadinessEstablished: true,
      probeAttempted: false,
      probeCount: 0,
      failureCategory: null,
      latencyMs: null,
      providerState: 'AUTHENTICATED',
      diagnostics: diagnosticsFixture({ providerState: 'AUTHENTICATED' }),
    });
    const daemon = await startSyntheticDaemon(staticDaemon(200, fixture));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const data = dataOf(response.body);
      expect(data.outcome).toBe('VERIFICATION_CONTRACT_VIOLATION');
      expect(data.state).toBe('UNAVAILABLE');
      expect(data.liveProviderContacted).toBe(false);
    } finally {
      await daemon.close();
    }
  });
});

describe('W-10 verify-connection route — the published report', () => {
  it('maps IPD CONFIGURED onto PRE_ACCESS and echoes the enumerated evidence', async () => {
    const daemon = await startSyntheticDaemon(staticDaemon(200, verificationFixture()));
    try {
      const response = await callVerify('POST', transportFor(daemon.baseUrl));
      const body = response.body as { data: Record<string, unknown>; provenance: Record<string, unknown> };
      const data = body.data;

      expect(body.provenance).toEqual(DHAN_VERIFY_CONNECTION_PROVENANCE);
      expect(body.provenance.authority).toBe('IPD');
      expect(body.provenance.transportSemantics).toBe(DHAN_VERIFY_CONNECTION_TRANSPORT_SEMANTICS);

      expect(data.action).toBe('VERIFY_CONNECTION');
      expect(data.outcome).toBe('EXECUTED');
      expect(data.requestsIssued).toBe(1);
      expect(data.state).toBe('PRE_ACCESS');
      expect(data.providerState).toBe('CREDENTIALS_RESOLVED');
      expect(data.credentialResolutionOutcome).toBe('CREDENTIALS_RESOLVED');
      expect(data.lastLatencyMs).toBeNull();
      expect(data.requestCounters).toMatchObject({ verificationProbes: 3, vendorRequestsTotal: 30 });
      expect(data.qualifiedMappingsLoaded).toBe(21);
      expect(data.vaultBackendId).toBe('WINDOWS_DPAPI');
      expect(data.vendorEgressMode).toBe('IPD_SERVER_HTTPS');
      expect(data.liveProviderConnectivity).toBe('NOT_CHECKED_PRE_ACCESS');
      expect(data.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
      expect(typeof data.checkedAt).toBe('string');
      expect(String(data.checkedAt)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      const verification = data.verification as Record<string, unknown>;
      expect(verification.contractVersion).toBe(1);
      expect(verification.checkedAt).toBe('2026-11-16T00:00:00.000Z');
    } finally {
      await daemon.close();
    }
  });

  it('verificationNoteFor states the honest boundary for every outcome', () => {
    expect(verificationNoteFor('NOT_ATTEMPTED_NOT_CONFIGURED', null)).toContain('not configured');
    expect(verificationNoteFor('TRANSPORT_UNAVAILABLE', null)).toContain('did not complete');
    expect(verificationNoteFor('VERIFICATION_CONTRACT_VIOLATION', null)).toContain('fail-closed');
    expect(verificationNoteFor('EXECUTED', 'VERIFIED_VENDOR_ACCEPTED')).toContain('vendor accepted authentication');
    expect(verificationNoteFor('EXECUTED', 'VERIFIED_LOCAL_ONLY')).toContain('NOT authentication to the vendor');
    expect(verificationNoteFor('EXECUTED', 'AUTH_REJECTED')).toContain('rejected authentication');
    expect(verificationNoteFor('EXECUTED', 'EXPIRED_LOCAL')).toContain('expired');
    expect(verificationNoteFor('EXECUTED', 'NOT_ATTEMPTED_NOT_READY')).toContain('local readiness was not established');
    expect(verificationNoteFor('EXECUTED', 'FAILED_TRANSPORT')).toContain('transport failed');
    expect(verificationNoteFor('EXECUTED', 'FAILED_VENDOR_RESPONSE')).toContain('could not be accepted');
  });

  it('publishes no credential, pointer, path or bearer prefix — in any outcome', async () => {
    const scenarios: ReadonlyArray<{ label: string; daemon?: { body: unknown; status?: number } }> = [
      { label: 'executed (local-only)', daemon: { body: verificationFixture() } },
      { label: 'executed (vendor-verified)', daemon: { body: vendorVerifiedFixture() } },
      { label: 'contract-violation', daemon: { body: verificationFixture({ providerState: 'TOTALLY_ONLINE' }) } },
      { label: 'non-2xx', daemon: { body: { error: { code: 'REQUEST_TIMEOUT', message: 'slow' } }, status: 504 } },
      { label: 'not json', daemon: { body: 'not json at all' } },
      { label: 'configured with full secrets-adjacent fixture', daemon: { body: verificationFixture({ diagnostics: diagnosticsFixture({ vaultBackendId: 'WINDOWS_DPAPI' }) }) } },
      { label: 'malicious extra field in wire payload', daemon: { body: { ...verificationFixture(), secretRefPointers: ['vault://dhan/local-nonprod/access-token-carrier'] } } },
    ];
    for (const scenario of scenarios) {
      const daemon = scenario.daemon
        ? await startSyntheticDaemon(staticDaemon(scenario.daemon.status ?? 200, scenario.daemon.body))
        : null;
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

describe('W-10 verify-connection route — bounded execution', () => {
  it('a daemon that never answers is bounded by the transport timeout — one request, safe outcome', async () => {
    // Accepts the socket but never responds: the pinned client's AbortSignal fires and the
    // verification resolves TRANSPORT_UNAVAILABLE with an enumerated TIMEOUT failure code.
    const requests: { method: string; path: string }[] = [];
    const server = http.createServer((req) => {
      requests.push({ method: req.method ?? '', path: (req.url ?? '').split('?')[0] });
      // Intentionally never respond.
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await callVerify('POST', {
        ok: true as const,
        config: { baseUrl: `http://127.0.0.1:${port}`, token: 'synthetic-token', timeoutMs: 50, configured: true as const },
      });
      expect(response.status).toBe(200);
      expect(requests).toEqual([{ method: 'POST', path: '/v1/connection/verify' }]);
      const data = dataOf(response.body);
      expect(data.attempted).toBe(true);
      expect(data.requestsIssued).toBe(1);
      expect(data.outcome).toBe('TRANSPORT_UNAVAILABLE');
      expect(data.failureCode).toBe('TIMEOUT');
      expect(data.state).toBe('UNAVAILABLE');
      expect(data.verification).toBeNull();
      expect(data.liveProviderContacted).toBe(false);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
