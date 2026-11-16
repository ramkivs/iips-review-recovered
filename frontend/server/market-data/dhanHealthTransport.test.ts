/**
 * DHAN-P2 — health route tests.
 *
 * These qualify the IRR-owned HTTP boundary: route mounting, method/path discipline, the
 * published envelope, and the conservative handling of missing, unavailable and contradictory
 * health information.
 *
 * Pre-access, offline and synthetic: no Dhan credential is read, no socket to any vendor is
 * opened, and no IPD market-data daemon is contacted.
 */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DHAN_HEALTH_CONTRACT_LEGACY_VERSION,
  DHAN_HEALTH_CONTRACT_VERSION,
  DHAN_HEALTH_PATH,
  DHAN_HEALTH_PROVENANCE,
  DHAN_HEALTH_TRANSPORT_SEMANTICS,
  buildDhanHealthReportForEnv,
  collectDhanHealthEvidence,
  handleDhanHealthRequest,
  isDhanHealthPath,
  probeDhanTransport,
  validateDhanServiceHealthContract,
  type DhanTransportProbe,
} from './dhanHealthTransport';
import { describeDhanProviderReadiness } from './dhanMarketDataRoute';
import { classifyDhanHealth } from './dhanHealthState';
import { resolveIpdMarketDataTransportConfig, createIpdMarketDataTransportClient } from './dhanMarketDataTransport';
import { validateDhanServiceHealth } from 'iips-production-market-data/dhan-server';

/** SecretRef POINTERS only. These are key paths, never secret values. */
const CONFIGURED_ENV = {
  IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH: 'vault://dhan/access-token',
  IIPS_DHAN_CLIENT_ID_SECRET_PATH: 'vault://dhan/client-id',
} as const;

async function call(
  path: string,
  method = 'GET',
  env: Record<string, string | undefined> = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const server = http.createServer((req, res) => {
    void handleDhanHealthRequest(req, res, { env });
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, { method });
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
    expect(isDhanHealthPath(undefined)).toBe(false);
  });

  it('answers 404 for lookalike paths and unsupported methods', async () => {
    expect((await call('/api/dhan')).status).toBe(404);
    expect((await call('/api/dhan/health/extra')).status).toBe(404);
    expect((await call('/api/dhan/health', 'POST')).status).toBe(404);
    expect((await call('/api/dhan/health', 'DELETE')).status).toBe(404);
  });

  it('serves the health route with GET', async () => {
    const response = await call(DHAN_HEALTH_PATH);
    expect(response.status).toBe(200);
  });
});

describe('DHAN-P2 health route — the published envelope', () => {
  it('publishes the report and the provenance block', async () => {
    const response = await call(DHAN_HEALTH_PATH, 'GET', CONFIGURED_ENV);
    expect(response.status).toBe(200);

    const body = response.body as {
      data: Record<string, unknown>;
      provenance: Record<string, unknown>;
    };
    expect(body.provenance).toEqual(DHAN_HEALTH_PROVENANCE);
    expect(body.provenance.transportSemantics).toBe(DHAN_HEALTH_TRANSPORT_SEMANTICS);
    expect(body.provenance.authority).toBe('IPD');

    // The provider configuration resolved, but the transport was never attempted: the
    // system is NOT connected — it is not "disconnected". (DHAN-P3 correction.)
    expect(body.data.state).toBe('PRE_ACCESS');
    expect(body.data.state).not.toBe('DISCONNECTED');
    expect(body.data.connectionAttempted).toBe(false);
    expect(body.data.providerId).toBe('DHAN_PROVIDER');
    expect(body.data.readiness).toBe('CREDENTIAL_REFERENCES_CONFIGURED');
    expect(body.data.configurationResolved).toBe(true);
  });

  it('reports PRE_ACCESS when no credential references are configured', async () => {
    const response = await call(DHAN_HEALTH_PATH, 'GET', {});
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.state).toBe('PRE_ACCESS');
    expect(data.readiness).toBe('PRE_ACCESS_CREDENTIALS_UNAVAILABLE');
    expect(data.failureCode).toBe('CREDENTIALS_UNAVAILABLE');
    expect(data.missingKeys).toEqual([
      'IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH',
      'IIPS_DHAN_CLIENT_ID_SECRET_PATH',
    ]);
  });

  it('never publishes a credential, a bearer token or a live claim', async () => {
    const response = await call(DHAN_HEALTH_PATH, 'GET', CONFIGURED_ENV);
    const serialized = JSON.stringify(response.body);

    // The installed IPD candidate redacts paths as well as values.
    expect(serialized).not.toContain('vault://dhan/access-token');
    expect(serialized).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
    expect(serialized).not.toContain('authorization');
    expect(serialized).not.toMatch(/Bearer\s/);

    // The pre-access honesty flags are always present and always false.
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.liveProviderContacted).toBe(false);
    expect(data.liveQualified).toBe(false);
    expect(data.transportReachable).toBe(false);
    expect(data.state).not.toBe('OPERATIONAL');
    expect(data.state).not.toBe('AUTHENTICATED');
  });

  it('reports configured references without exposing pointer paths', async () => {
    const response = await call(DHAN_HEALTH_PATH, 'GET', CONFIGURED_ENV);
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.secretRefPointers).toEqual([]);
    expect(data.readiness).toBe('CREDENTIAL_REFERENCES_CONFIGURED');
    expect(data.missingKeys).toEqual([]);
  });

  it('discloses the phase boundary in the report', async () => {
    const response = await call(DHAN_HEALTH_PATH, 'GET', {});
    const data = (response.body as { data: Record<string, unknown> }).data;
    const disclosure = String(data.disclosure);
    expect(disclosure).toContain('PRE-ACCESS');
    expect(disclosure).toContain('NOT live-qualified');
    expect(disclosure).toContain('not production readiness');
  });
});

describe('DHAN-P2 health route — conservative handling of degraded evidence', () => {
  it('reports UNAVAILABLE when the provider configuration cannot be assessed at all', () => {
    // A malformed secret path is a CONFIGURATION_INCOMPLETE resolution: the provider
    // configuration did not resolve, so no provider state is claimed.
    const report = buildDhanHealthReportForEnv({
      IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH: 'not-a-vault-path',
      IIPS_DHAN_CLIENT_ID_SECRET_PATH: 'not-a-vault-path',
    });
    expect(report.configurationResolved).toBe(false);
    expect(report.state).toBe('PRE_ACCESS');
    expect(report.liveQualified).toBe(false);
  });

  it('reports the transport as unreachable because the live integration is not part of this phase', () => {
    const readiness = describeDhanProviderReadiness(CONFIGURED_ENV);
    const evidence = collectDhanHealthEvidence(readiness);
    expect(evidence.transportReachable).toBe(false);
    expect(evidence.liveProviderConnectivity).toBe('NOT_CHECKED_PRE_ACCESS');
    expect(evidence.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
  });

  it('does not promote the provider qualification in any state', () => {
    for (const env of [{}, CONFIGURED_ENV]) {
      const report = buildDhanHealthReportForEnv(env);
      expect(report.liveQualified).toBe(false);
      expect(report.liveProviderContacted).toBe(false);
      expect(report.state).not.toBe('AUTHENTICATED');
      expect(report.state).not.toBe('OPERATIONAL');
    }
  });
});

describe('DHAN-P2 health route — scope refusals', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const transportSource = readFileSync(resolve(here, 'dhanHealthTransport.ts'), 'utf8');

  it('is process-level status and is deliberately NOT owner-scoped', () => {
    // The route reports PROCESS-LEVEL provider status (the same class of fact as the existing
    // `/api/health`), not a user's private data: it establishes no owner context and accepts
    // no tenant, owner or credential from the request.
    //
    // It is therefore deliberately outside `OWNER_SCOPED_API_PREFIXES`: an owner-scoped route
    // would answer 503 whenever the owner context is unavailable, and the DHAN status surface
    // must remain usable on a workstation with no established owner and no running IPD daemon.
    const executiveSource = readFileSync(
      resolve(here, '..', 'executive-transport.ts'),
      'utf8',
    );
    const ownerScopedBlock = executiveSource.slice(
      executiveSource.indexOf('const OWNER_SCOPED_API_PREFIXES'),
      executiveSource.indexOf('] as const);'),
    );
    expect(ownerScopedBlock).not.toContain('/api/dhan');
    // The route IS mounted in the active dispatcher.
    expect(executiveSource).toContain("req.url === '/api/dhan/health'");
    expect(executiveSource).toContain("import('./market-data/dhanHealthTransport')");
  });

  it('is server-side only: no src/ module imports the health boundary', () => {
    // The browser must never import the server boundary: it carries the provider
    // configuration surface and must not reach the browser bundle.
    expect(transportSource).toContain("from './dhanMarketDataRoute'");
  });

  it('reads no ambient process.env inside the transport module', () => {
    expect(transportSource).not.toMatch(/process\.env/);
  });

  it('does not construct a provider client, a credential resolver or a market-data service', () => {
    expect(transportSource).not.toMatch(/new\s+DhanApiClient\s*\(/);
    expect(transportSource).not.toMatch(/DhanMarketDataService/);
    expect(transportSource).not.toMatch(/LocalHostVaultDhanCredentialResolver/);
    // The health route does not construct the transport client either: it delegates to the
    // shared composition module, which owns the single construction site.
    expect(transportSource).not.toMatch(/new\s+MarketDataTransportClient\s*\(/);
  });
});

describe('DHAN-P2 health route — the transport probe (DHAN-P3 clarification)', () => {
  it('reports a reachable transport with IPD own authoritative service health', async () => {
    const probe = await probeDhanTransport(
      {},
      {
        transport: {
          ok: true,
          config: {
            baseUrl: await startHealthTransport({
              service: 'UP',
              providerConfiguration: 'CONFIGURED',
              liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
              providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
            }),
            token: 'synthetic-token',
            timeoutMs: 2000,
            configured: true,
          },
        },
      },
    );

    expect(probe.attempted).toBe(true);
    expect(probe.reachable).toBe(true);
    expect(probe.serviceHealth?.service).toBe('UP');
    expect(probe.serviceHealth?.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
  });

  it('reports an attempted-but-failed transport as attempted', async () => {
    const probe = await probeDhanTransport(
      {},
      {
        transport: {
          ok: true,
          config: {
            // A port nothing is listening on: the connection is attempted and fails.
            baseUrl: 'http://127.0.0.1:1',
            token: 'synthetic-token',
            timeoutMs: 500,
            configured: true,
          },
        },
      },
    );

    expect(probe.attempted).toBe(true);
    expect(probe.reachable).toBe(false);
    expect(probe.serviceHealth).toBeUndefined();
  });

  it('reports an unconfigured transport as NOT attempted', async () => {
    const probe = await probeDhanTransport({}, { transport: resolveIpdMarketDataTransportConfig({}) });
    expect(probe.attempted).toBe(false);
    expect(probe.reachable).toBe(false);
  });

  it('classifies an attempted failure as DISCONNECTED and a never-attempted transport as not disconnected', async () => {
    const readiness = describeDhanProviderReadiness(CONFIGURED_ENV);

    const attempted = collectDhanHealthEvidence(readiness, { attempted: true, reachable: false });
    expect(classifyDhanHealth(attempted)).toBe('DISCONNECTED');

    const notAttempted = collectDhanHealthEvidence(readiness, { attempted: false, reachable: false });
    expect(classifyDhanHealth(notAttempted)).not.toBe('DISCONNECTED');
  });
});

describe('W-07 IRR mirror compatibility — governed D-7 health contract', () => {
  const LEGACY = {
    service: 'UP',
    providerConfiguration: 'CONFIGURED',
    liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  } as const;

  it('accepts every legacy value and preserves it verbatim', () => {
    const validation = validateDhanServiceHealthContract(LEGACY);
    expect(validation.ok).toBe(true);
    if (validation.ok) {
      expect(validation.serviceHealth.liveProviderConnectivity).toBe('NOT_CHECKED_PRE_ACCESS');
      expect(validation.serviceHealth.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
      expect(validation.serviceHealth.contractVersion).toBeUndefined();
    }
  });

  it('accepts a missing version marker as legacy compatibility', () => {
    expect(validateDhanServiceHealthContract(LEGACY).ok).toBe(true);
    expect(validateDhanServiceHealthContract({ ...LEGACY, contractVersion: 1 }).ok).toBe(true);
    expect(
      validateDhanServiceHealthContract({ ...LEGACY, contractVersion: DHAN_HEALTH_CONTRACT_VERSION }).ok,
    ).toBe(true);
  });

  it('accepts every new D-7 connectivity and qualification value', () => {
    for (const liveProviderConnectivity of ['NOT_CHECKED_PRE_ACCESS', 'CONNECTED_LIVE']) {
      for (const providerQualification of ['SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED', 'LIVE_QUALIFIED']) {
        const validation = validateDhanServiceHealthContract({
          ...LEGACY,
          liveProviderConnectivity,
          providerQualification,
          contractVersion: DHAN_HEALTH_CONTRACT_VERSION,
        });
        expect(validation.ok).toBe(true);
        if (validation.ok) {
          expect(validation.serviceHealth.liveProviderConnectivity).toBe(liveProviderConnectivity);
          expect(validation.serviceHealth.providerQualification).toBe(providerQualification);
        }
      }
    }
  });

  it('rejects unknown connectivity and qualification values fail-closed', () => {
    const connectivity = validateDhanServiceHealthContract({
      ...LEGACY,
      liveProviderConnectivity: 'CONNECTED_MAYBE',
    });
    expect(connectivity).toEqual({ ok: false, violation: 'UNKNOWN_CONNECTIVITY_VALUE' });

    const qualification = validateDhanServiceHealthContract({
      ...LEGACY,
      providerQualification: 'PROBABLY_LIVE',
    });
    expect(qualification).toEqual({ ok: false, violation: 'UNKNOWN_QUALIFICATION_VALUE' });
  });

  it('rejects unknown contract versions fail-closed', () => {
    for (const contractVersion of [0, 3, 99, '2', null, Number.NaN]) {
      const validation = validateDhanServiceHealthContract({ ...LEGACY, contractVersion });
      expect(validation).toEqual({ ok: false, violation: 'UNKNOWN_CONTRACT_VERSION' });
    }
  });

  it('round-trips each governed value pair through evidence into classification', () => {
    const cases: ReadonlyArray<{
      liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS' | 'CONNECTED_LIVE';
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED' | 'LIVE_QUALIFIED';
      expectedState: string;
    }> = [
      {
        // Legacy values over a reachable transport keep the existing classification
        // semantics exactly: no live signal is asserted, so nothing is upgraded.
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        expectedState: 'UNAVAILABLE',
      },
      {
        liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
        providerQualification: 'LIVE_QUALIFIED',
        // A live qualification WITHOUT live connectivity is not operational and not
        // authenticated: the connectivity signal is the one that carries authentication.
        expectedState: 'UNAVAILABLE',
      },
      {
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        expectedState: 'AUTHENTICATED',
      },
      {
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'LIVE_QUALIFIED',
        expectedState: 'OPERATIONAL',
      },
    ];
    for (const testCase of cases) {
      const probe: DhanTransportProbe = {
        attempted: true,
        reachable: true,
        serviceHealth: {
          service: 'UP',
          providerConfiguration: 'CONFIGURED',
          liveProviderConnectivity: testCase.liveProviderConnectivity,
          providerQualification: testCase.providerQualification,
          contractVersion: DHAN_HEALTH_CONTRACT_VERSION,
        },
      };
      // Classification is asserted on the probe-shaped evidence path (collect + classify),
      // which is the exact composition the health route performs after a successful probe.
      const evidence = collectDhanHealthEvidence(describeDhanProviderReadiness(CONFIGURED_ENV), probe);
      expect(classifyDhanHealth(evidence)).toBe(testCase.expectedState);
    }
  });

  it('the pinned IPD W-07 client round-trips the governed live values (pin advance guard)', async () => {
    // The pin now carries the published IPD W-07 commit
    // `5b384c7215b2644a8d525960ba05cd97f39bf7a7` (IPD PR #168): its MarketDataTransportClient
    // validates with IPD's own `validateDhanServiceHealth`, which governs the same D-7
    // vocabularies IRR enforces. The live values therefore round-trip to an authoritative
    // answer instead of MALFORMED_RESPONSE. If this test fails because the client rejected a
    // governed value, the pin and the contract have drifted apart and must be reconciled —
    // never by weakening either validator.
    const baseUrl = await startHealthTransport({
      service: 'UP',
      providerConfiguration: 'CONFIGURED',
      liveProviderConnectivity: 'CONNECTED_LIVE',
      providerQualification: 'LIVE_QUALIFIED',
      contractVersion: DHAN_HEALTH_CONTRACT_VERSION,
    });
    const probe = await probeDhanTransport(
      {},
      {
        transport: {
          ok: true,
          config: { baseUrl, token: 'synthetic-token', timeoutMs: 2000, configured: true },
        },
      },
    );
    expect(probe.attempted).toBe(true);
    expect(probe.reachable).toBe(true);
    expect(probe.contractViolation).toBeUndefined();
    expect(probe.serviceHealth).toEqual({
      service: 'UP',
      providerConfiguration: 'CONFIGURED',
      liveProviderConnectivity: 'CONNECTED_LIVE',
      providerQualification: 'LIVE_QUALIFIED',
      contractVersion: DHAN_HEALTH_CONTRACT_VERSION,
    });
  });

  it('reports UNAVAILABLE, never DISCONNECTED or upgraded, on a contract violation', () => {
    const probe: DhanTransportProbe = { attempted: true, reachable: true, contractViolation: true };
    const evidence = collectDhanHealthEvidence(describeDhanProviderReadiness(CONFIGURED_ENV), probe);
    expect(evidence.healthContractViolation).toBe(true);
    expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
  });
});

/**
 * W-07 — cross-repository round-trip qualification against the INSTALLED pinned IPD package
 * (`iips-production-market-data@1.0.0`, git pin `5b384c7215b2644a8d525960ba05cd97f39bf7a7`,
 * IPD PR #168).
 *
 * Every test in this block exercises the real `MarketDataTransportClient.health()` — never a
 * mock — against a synthetic loopback `/v1/health` endpoint. The loopback endpoint is the
 * transport daemon; it is local, synthetic and credential-free by construction, and no Dhan
 * vendor endpoint is ever contacted.
 */
const INSTALLED_CLIENT_CONNECTIVITY = ['NOT_CHECKED_PRE_ACCESS', 'CONNECTED_LIVE'] as const;
const INSTALLED_CLIENT_QUALIFICATION = [
  'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  'LIVE_QUALIFIED',
] as const;
const INSTALLED_CLIENT_VERSIONS = [
  { label: 'marker absent (legacy)', marker: undefined as number | undefined },
  { label: 'legacy marker 1', marker: DHAN_HEALTH_CONTRACT_LEGACY_VERSION as number | undefined },
  { label: 'W-07 marker 2', marker: DHAN_HEALTH_CONTRACT_VERSION as number | undefined },
] as const;

function jsonHealthResponder(body: unknown, status = 200) {
  return (_req: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  };
}

function rawHealthResponder(text: string, status = 200) {
  return (_req: http.IncomingMessage, res: http.ServerResponse) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(text);
  };
}

/** Starts a synthetic `/v1/health` responder, runs `run` against it, and always closes it. */
async function withHealthEndpoint(
  responder: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  run: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = http.createServer(responder);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function clientFor(baseUrl: string) {
  return createIpdMarketDataTransportClient({
    baseUrl,
    token: 'synthetic-token',
    timeoutMs: 2000,
    configured: true,
  });
}

describe('W-07 installed IPD package — installed-client compatibility (pinned commit 5b384c72)', () => {
  const LEGACY_LIVE = {
    service: 'UP',
    providerConfiguration: 'CONFIGURED',
    liveProviderConnectivity: 'CONNECTED_LIVE',
    providerQualification: 'LIVE_QUALIFIED',
    contractVersion: DHAN_HEALTH_CONTRACT_VERSION,
  } as const;

  it('round-trips all 12 (connectivity × qualification × contractVersion) combinations through the installed client', async () => {
    let verified = 0;
    for (const liveProviderConnectivity of INSTALLED_CLIENT_CONNECTIVITY) {
      for (const providerQualification of INSTALLED_CLIENT_QUALIFICATION) {
        for (const { label, marker } of INSTALLED_CLIENT_VERSIONS) {
          const payload: Record<string, unknown> = {
            service: 'UP',
            providerConfiguration: 'CONFIGURED',
            liveProviderConnectivity,
            providerQualification,
            ...(marker !== undefined ? { contractVersion: marker } : {}),
          };
          await withHealthEndpoint(jsonHealthResponder(payload), async (baseUrl) => {
            const outcome = await clientFor(baseUrl).health();
            expect(outcome.ok, `expected ${label} to parse`).toBe(true);
            if (!outcome.ok) return;
            expect(outcome.liveProviderConnectivity).toBe(liveProviderConnectivity);
            expect(outcome.providerQualification).toBe(providerQualification);
            if (marker === undefined) {
              expect('contractVersion' in outcome).toBe(false);
            } else {
              expect(outcome.contractVersion).toBe(marker);
            }
          });
          verified += 1;
        }
      }
    }
    expect(verified).toBe(12);
  });

  it('parses the legacy pre-W-07 payload (no marker, legacy values) byte-for-byte', async () => {
    const payload = {
      service: 'UP',
      providerConfiguration: 'CONFIGURED',
      liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    };
    await withHealthEndpoint(jsonHealthResponder(payload), async (baseUrl) => {
      const outcome = await clientFor(baseUrl).health();
      expect(outcome).toEqual({ ok: true, ...payload });
    });
  });

  it('emits the legacy payload with the legacy marker 1 preserved verbatim', async () => {
    const payload = {
      service: 'UP',
      providerConfiguration: 'CONFIGURED',
      liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      contractVersion: DHAN_HEALTH_CONTRACT_LEGACY_VERSION,
    };
    await withHealthEndpoint(jsonHealthResponder(payload), async (baseUrl) => {
      const outcome = await clientFor(baseUrl).health();
      expect(outcome).toEqual({ ok: true, ...payload });
    });
  });

  it('strips ungoverned extra properties instead of reflecting them', async () => {
    const payload = { ...LEGACY_LIVE, secretAccessToken: 'must-not-be-reflected', debugDump: { env: true } };
    await withHealthEndpoint(jsonHealthResponder(payload), async (baseUrl) => {
      const outcome = await clientFor(baseUrl).health();
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return;
      expect(outcome).not.toHaveProperty('secretAccessToken');
      expect(outcome).not.toHaveProperty('debugDump');
    });
  });

  const REJECT_CASES: ReadonlyArray<readonly [string, Record<string, unknown>]> = [
    ['unknown connectivity value', { ...LEGACY_LIVE, liveProviderConnectivity: 'CONNECTED_MAYBE' }],
    ['unknown connectivity casing', { ...LEGACY_LIVE, liveProviderConnectivity: 'connected_live' }],
    ['unknown qualification value', { ...LEGACY_LIVE, providerQualification: 'PROBABLY_LIVE' }],
    ['unknown qualification casing', { ...LEGACY_LIVE, providerQualification: 'live_qualified' }],
    ['contractVersion 0', { ...LEGACY_LIVE, contractVersion: 0 }],
    ['contractVersion 3', { ...LEGACY_LIVE, contractVersion: 3 }],
    ['contractVersion 99', { ...LEGACY_LIVE, contractVersion: 99 }],
    ['contractVersion 1.5', { ...LEGACY_LIVE, contractVersion: 1.5 }],
    ['contractVersion NaN (serialized as null on the wire)', { ...LEGACY_LIVE, contractVersion: Number.NaN }],
    ['contractVersion string "1"', { ...LEGACY_LIVE, contractVersion: '1' }],
    ['contractVersion string "2"', { ...LEGACY_LIVE, contractVersion: '2' }],
    ['contractVersion null', { ...LEGACY_LIVE, contractVersion: null }],
    ['contractVersion boolean', { ...LEGACY_LIVE, contractVersion: true }],
    ['contractVersion object', { ...LEGACY_LIVE, contractVersion: {} }],
    ['service SIDEWAYS', { ...LEGACY_LIVE, service: 'SIDEWAYS' }],
    ['providerConfiguration MAYBE_CONFIGURED', { ...LEGACY_LIVE, providerConfiguration: 'MAYBE_CONFIGURED' }],
    [
      'missing liveProviderConnectivity',
      { service: 'UP', providerConfiguration: 'CONFIGURED', providerQualification: 'LIVE_QUALIFIED', contractVersion: 2 },
    ],
    [
      'missing providerQualification',
      { service: 'UP', providerConfiguration: 'CONFIGURED', liveProviderConnectivity: 'CONNECTED_LIVE', contractVersion: 2 },
    ],
    [
      'missing service',
      { providerConfiguration: 'CONFIGURED', liveProviderConnectivity: 'CONNECTED_LIVE', providerQualification: 'LIVE_QUALIFIED', contractVersion: 2 },
    ],
    [
      'missing providerConfiguration',
      { service: 'UP', liveProviderConnectivity: 'CONNECTED_LIVE', providerQualification: 'LIVE_QUALIFIED', contractVersion: 2 },
    ],
    ['contradictory body (ok:false)', { ...LEGACY_LIVE, ok: false }],
    [
      'contradictory body (ok:true with error envelope)',
      { ...LEGACY_LIVE, ok: true, error: { code: 'ERR', message: 'boom' } },
    ],
    [
      'contradictory body (ok:true with failure envelope)',
      { ...LEGACY_LIVE, ok: true, failure: { code: 'ERR', priorPreserved: false } },
    ],
    ['contradictory body (error envelope without ok)', { ...LEGACY_LIVE, error: { code: 'ERR', message: 'boom' } }],
    ['contradictory body (failure envelope without ok)', { ...LEGACY_LIVE, failure: { code: 'ERR', priorPreserved: false } }],
    ['ok present but not boolean true', { ...LEGACY_LIVE, ok: 1 }],
  ];

  for (const [label, payload] of REJECT_CASES) {
    it(`fails closed on ${label}`, async () => {
      await withHealthEndpoint(jsonHealthResponder(payload), async (baseUrl) => {
        const outcome = await clientFor(baseUrl).health();
        expect(outcome.ok).toBe(false);
        if (outcome.ok) return;
        expect(outcome.service).toBe('DOWN');
        expect(outcome.failure.code).toBe('MALFORMED_RESPONSE');
      });
    });
  }

  it('fails closed when the body is not valid JSON', async () => {
    await withHealthEndpoint(rawHealthResponder('this is not json'), async (baseUrl) => {
      const outcome = await clientFor(baseUrl).health();
      expect(outcome.ok).toBe(false);
      if (outcome.ok) return;
      expect(outcome.failure.code).toBe('MALFORMED_RESPONSE');
    });
  });

  it('fails closed when the body is an array', async () => {
    await withHealthEndpoint(rawHealthResponder('[1,2,3]'), async (baseUrl) => {
      const outcome = await clientFor(baseUrl).health();
      expect(outcome.ok).toBe(false);
      if (outcome.ok) return;
      expect(outcome.failure.code).toBe('MALFORMED_RESPONSE');
    });
  });

  it('carries the daemon error code through on a non-2xx answer (never classified as health)', async () => {
    await withHealthEndpoint(
      jsonHealthResponder({ error: { code: 'REQUEST_TIMEOUT', message: 'slow' } }, 504),
      async (baseUrl) => {
        const outcome = await clientFor(baseUrl).health();
        expect(outcome.ok).toBe(false);
        if (outcome.ok) return;
        expect(outcome.failure.code).toBe('REQUEST_TIMEOUT');
      },
    );
  });

  it('IRR and the installed IPD validator agree exactly on the governed field space', () => {
    const services = ['UP', 'DOWN', 'SIDEWAYS', undefined, null] as const;
    const providerConfigs = [
      'CONFIGURED',
      'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
      'KIND_OF_CONFIGURED',
      undefined,
      null,
    ] as const;
    const connectivities = [
      'NOT_CHECKED_PRE_ACCESS',
      'CONNECTED_LIVE',
      'CONNECTED_MAYBE',
      '',
      42,
      false,
      null,
      undefined,
    ] as const;
    const qualifications = [
      'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      'LIVE_QUALIFIED',
      'PROBABLY_LIVE',
      '',
      42,
      false,
      null,
      undefined,
    ] as const;
    const versions: ReadonlyArray<{ readonly label: string; readonly value: unknown }> = [
      { label: 'absent', value: undefined },
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '0', value: 0 },
      { label: '3', value: 3 },
      { label: '99', value: 99 },
      { label: '-1', value: -1 },
      { label: '1.5', value: 1.5 },
      { label: 'NaN', value: Number.NaN },
      { label: "'1'", value: '1' },
      { label: "'2'", value: '2' },
      { label: 'null', value: null },
      { label: 'true', value: true },
      { label: 'false', value: false },
      { label: 'object', value: {} },
      { label: 'array', value: [2] },
    ];

    let checked = 0;
    for (const service of services) {
      for (const providerConfiguration of providerConfigs) {
        for (const liveProviderConnectivity of connectivities) {
          for (const providerQualification of qualifications) {
            for (const version of versions) {
              const input: Record<string, unknown> = {
                service,
                providerConfiguration,
                liveProviderConnectivity,
                providerQualification,
              };
              // An explicitly undefined marker is indistinguishable from an absent one on the wire.
              if (version.value !== undefined) {
                input.contractVersion = version.value;
              }
              const ipd = validateDhanServiceHealth(input);
              const irr = validateDhanServiceHealthContract(input);
              expect(
                irr.ok,
                `IRR/IPD verdict mismatch at ${JSON.stringify(input)}`,
              ).toBe(ipd !== null);
              if (ipd !== null && irr.ok) {
                expect(irr.serviceHealth.service).toBe(ipd.service);
                expect(irr.serviceHealth.providerConfiguration).toBe(ipd.providerConfiguration);
                expect(irr.serviceHealth.liveProviderConnectivity).toBe(ipd.liveProviderConnectivity);
                expect(irr.serviceHealth.providerQualification).toBe(ipd.providerQualification);
                expect(irr.serviceHealth.contractVersion).toBe(ipd.contractVersion);
                expect(
                  Object.prototype.hasOwnProperty.call(irr.serviceHealth, 'contractVersion'),
                ).toBe(Object.prototype.hasOwnProperty.call(ipd, 'contractVersion'));
              }
              checked += 1;
            }
          }
        }
      }
    }
    expect(checked).toBe(services.length * providerConfigs.length * connectivities.length * qualifications.length * versions.length);
  });

  it('maps every installed-client contract rejection to a probe contractViolation (never DISCONNECTED)', async () => {
    const rejectedPayloads: ReadonlyArray<Record<string, unknown>> = [
      { ...LEGACY_LIVE, liveProviderConnectivity: 'CONNECTED_MAYBE' },
      { ...LEGACY_LIVE, providerQualification: 'PROBABLY_LIVE' },
      { ...LEGACY_LIVE, contractVersion: 3 },
      { ...LEGACY_LIVE, ok: false },
    ];
    for (const payload of rejectedPayloads) {
      const baseUrl = await startHealthTransport(payload);
      const probe = await probeDhanTransport(
        {},
        {
          transport: {
            ok: true,
            config: { baseUrl, token: 'synthetic-token', timeoutMs: 2000, configured: true },
          },
        },
      );
      expect(probe).toEqual({ attempted: true, reachable: true, contractViolation: true });
      const evidence = collectDhanHealthEvidence(describeDhanProviderReadiness(CONFIGURED_ENV), probe);
      expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
    }
  });

  it('classifies a self-contradictory but wire-valid live-over-DOWN payload as UNAVAILABLE', async () => {
    // The installed client accepts this body (every field is governed and consistent with the
    // published wire type): service DOWN contradicted only by the classifier's live rule.
    const baseUrl = await startHealthTransport({ ...LEGACY_LIVE, service: 'DOWN' });
    const probe = await probeDhanTransport(
      {},
      {
        transport: {
          ok: true,
          config: { baseUrl, token: 'synthetic-token', timeoutMs: 2000, configured: true },
        },
      },
    );
    expect(probe.reachable).toBe(true);
    const evidence = collectDhanHealthEvidence(describeDhanProviderReadiness(CONFIGURED_ENV), probe);
    expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
  });

  it('round-trips a legacy (no marker) live payload into classification identically to a marked one', async () => {
    for (const marker of [undefined, DHAN_HEALTH_CONTRACT_LEGACY_VERSION, DHAN_HEALTH_CONTRACT_VERSION]) {
      const payload: Record<string, unknown> = {
        service: 'UP',
        providerConfiguration: 'CONFIGURED',
        liveProviderConnectivity: 'CONNECTED_LIVE',
        providerQualification: 'LIVE_QUALIFIED',
        ...(marker !== undefined ? { contractVersion: marker } : {}),
      };
      const baseUrl = await startHealthTransport(payload);
      const probe = await probeDhanTransport(
        {},
        {
          transport: {
            ok: true,
            config: { baseUrl, token: 'synthetic-token', timeoutMs: 2000, configured: true },
          },
        },
      );
      expect(probe.reachable).toBe(true);
      const evidence = collectDhanHealthEvidence(describeDhanProviderReadiness(CONFIGURED_ENV), probe);
      expect(classifyDhanHealth(evidence)).toBe('OPERATIONAL');
    }
  });

  it('reports a pre-access legacy payload over a reachable transport as before (no upgrade)', async () => {
    const baseUrl = await startHealthTransport({
      service: 'UP',
      providerConfiguration: 'CONFIGURED',
      liveProviderConnectivity: 'NOT_CHECKED_PRE_ACCESS',
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    });
    const probe = await probeDhanTransport(
      {},
      {
        transport: {
          ok: true,
          config: { baseUrl, token: 'synthetic-token', timeoutMs: 2000, configured: true },
        },
      },
    );
    expect(probe.reachable).toBe(true);
    expect(probe.serviceHealth?.contractVersion).toBeUndefined();
    const evidence = collectDhanHealthEvidence(describeDhanProviderReadiness(CONFIGURED_ENV), probe);
    // Identical classification semantics to the pre-pin behaviour: nothing live is claimed.
    expect(classifyDhanHealth(evidence)).toBe('UNAVAILABLE');
  });
});

/** Starts a synthetic IPD health endpoint and returns its base URL. */
async function startHealthTransport(body: Record<string, unknown>): Promise<string> {
  const server = http.createServer((_req, res) => {
    const text = JSON.stringify(body);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(text);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return `http://127.0.0.1:${port}`;
}
