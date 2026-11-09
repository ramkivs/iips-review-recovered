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
  DHAN_HEALTH_PATH,
  DHAN_HEALTH_PROVENANCE,
  DHAN_HEALTH_TRANSPORT_SEMANTICS,
  buildDhanHealthReportForEnv,
  collectDhanHealthEvidence,
  handleDhanHealthRequest,
  isDhanHealthPath,
  probeDhanTransport,
} from './dhanHealthTransport';
import { describeDhanProviderReadiness } from './dhanMarketDataRoute';
import { classifyDhanHealth } from './dhanHealthState';
import { resolveIpdMarketDataTransportConfig } from './dhanMarketDataTransport';

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

    // SecretRef POINTERS are published; values are not.
    expect(serialized).toContain('vault://dhan/access-token');
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

  it('publishes only pointer paths for configured references', async () => {
    const response = await call(DHAN_HEALTH_PATH, 'GET', CONFIGURED_ENV);
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.secretRefPointers).toEqual([
      'vault://dhan/access-token',
      'vault://dhan/client-id',
    ]);
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
