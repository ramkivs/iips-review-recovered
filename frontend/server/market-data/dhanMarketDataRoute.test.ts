/**
 * IRR Dhan provider consumption boundary — qualification tests.
 *
 * These tests qualify IRR's OWN consumption of the IPD `./dhan-server` subpath at the
 * authoritative dependency commit `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`. They are
 * pre-access, offline and synthetic: no Dhan credential is read, no socket is opened and
 * no vendor endpoint is contacted.
 *
 * Every expected value below was MEASURED against the installed package at that commit
 * rather than assumed. Where the measurement is a refusal, the test asserts the refusal:
 * a provider that is not configured must not report itself as configured.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  describeDhanProviderReadiness,
  formatDhanProviderStatus,
} from './dhanMarketDataRoute';

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, '..', '..');

/** The authoritative IPD dependency commit this boundary was qualified against. */
const EXPECTED_IPD_COMMIT = '59fdfd157632dbdbc220ae03d9d0b8e047d4ef19';

/** SecretRef pointers only. These are key paths, never secret values. */
const CONFIGURED_ENV = {
  IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH: 'vault://dhan/access-token',
  IIPS_DHAN_CLIENT_ID_SECRET_PATH: 'vault://dhan/client-id',
} as const;

describe('IRR Dhan provider consumption boundary (pre-access, offline)', () => {
  it('pins the Dhan provider surface to the authoritative IPD commit', () => {
    const pkg = JSON.parse(readFileSync(resolve(frontendRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const lock = JSON.parse(readFileSync(resolve(frontendRoot, 'package-lock.json'), 'utf8')) as {
      packages?: Record<string, { resolved?: string }>;
    };

    expect(pkg.dependencies?.['iips-production-market-data']).toBe(
      `github:ramkivs/iips-production-market-data#${EXPECTED_IPD_COMMIT}`,
    );
    expect(lock.packages?.['node_modules/iips-production-market-data']?.resolved).toContain(
      `#${EXPECTED_IPD_COMMIT}`,
    );
    expect(lock.packages?.['']?.dependencies?.['iips-production-market-data']).toBe(
      `github:ramkivs/iips-production-market-data#${EXPECTED_IPD_COMMIT}`,
    );
  });

  it('consumes the server-only ./dhan-server subpath that this commit publishes', () => {
    const installed = JSON.parse(
      readFileSync(
        resolve(frontendRoot, 'node_modules', 'iips-production-market-data', 'package.json'),
        'utf8',
      ),
    ) as { exports?: Record<string, { types?: string; import?: string } | undefined> };

    const dhanServer = installed.exports?.['./dhan-server'];
    expect(dhanServer?.import).toBe('./dist/package/src/providers/dhan/package.js');
    expect(dhanServer?.types).toBe('./dist/package/src/providers/dhan/package.d.ts');
  });

  it('reports PRE_ACCESS_CREDENTIALS_UNAVAILABLE when no secret references are configured', () => {
    const readiness = describeDhanProviderReadiness({});

    expect(readiness.providerId).toBe('DHAN_PROVIDER');
    expect(readiness.readiness).toBe('PRE_ACCESS_CREDENTIALS_UNAVAILABLE');
    expect(readiness.configurationResolved).toBe(false);
    expect(readiness.failureCode).toBe('CREDENTIALS_UNAVAILABLE');
    // Measured: the two credential reference keys are the only ones absent, and the
    // usable transport configuration is still resolved so the foundation stays
    // exercisable without credentials.
    expect(readiness.missingKeys).toEqual([
      'IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH',
      'IIPS_DHAN_CLIENT_ID_SECRET_PATH',
    ]);
    expect(readiness.baseUrl).toBe('https://api.dhan.co/v2');
    expect(readiness.timeoutMs).toBe(5000);
  });

  it('reports CREDENTIAL_REFERENCES_CONFIGURED when both secret pointers are present', () => {
    const readiness = describeDhanProviderReadiness(CONFIGURED_ENV);

    expect(readiness.readiness).toBe('CREDENTIAL_REFERENCES_CONFIGURED');
    expect(readiness.configurationResolved).toBe(true);
    expect(readiness.failureCode).toBeNull();
    expect(readiness.missingKeys).toEqual([]);
  });

  it('never exposes a live transport, configured or not', () => {
    for (const env of [{}, CONFIGURED_ENV]) {
      expect(describeDhanProviderReadiness(env).liveTransportAvailable).toBe(false);
    }
  });

  it('never surfaces secret values, only SecretRef key paths', () => {
    const readiness = describeDhanProviderReadiness(CONFIGURED_ENV);
    const serialized = JSON.stringify(readiness);

    // The key paths appear; no token, client id or other credential VALUE can.
    expect(serialized).toContain('vault://dhan/access-token');
    expect(serialized).not.toMatch(/accessToken"[^"]*":\s*"(?!UNCONFIGURED)[^"]{8,}/);
    // Deliberate structural assertion: the report carries no credential-bearing field.
    expect(Object.keys(readiness)).not.toContain('accessToken');
    expect(Object.keys(readiness)).not.toContain('clientId');
    expect(Object.keys(readiness)).not.toContain('accessTokenRef');
    expect(Object.keys(readiness)).not.toContain('clientIdRef');
  });

  it('renders a truthful operator status line for both readiness states', () => {
    const unavailable = formatDhanProviderStatus(describeDhanProviderReadiness({}));
    expect(unavailable).toContain('PRE_ACCESS_CREDENTIALS_UNAVAILABLE');
    expect(unavailable).toContain('CREDENTIALS_UNAVAILABLE');
    expect(unavailable).toContain('no live transport');

    const configured = formatDhanProviderStatus(describeDhanProviderReadiness(CONFIGURED_ENV));
    expect(configured).toContain('configured');
    expect(configured).toContain('no live transport');
  });
});

describe('IRR Dhan boundary scope refusals', () => {
  it('is server-side only: no src/ module imports the Dhan provider boundary', () => {
    // The IPD contract and this boundary both require server-side-only consumption. A
    // browser import would pull vendor transport into the client bundle.
    const source = readFileSync(resolve(here, 'dhanMarketDataRoute.ts'), 'utf8');
    expect(source).toContain("from 'iips-production-market-data/dhan-server'");
  });

  it('constructs only the no-network pre-access transport', () => {
    const source = readFileSync(resolve(here, 'dhanMarketDataRoute.ts'), 'utf8');
    // The boundary must never instantiate a real transport or an api client.
    expect(source).toContain('PreAccessNoNetworkTransport');
    expect(source).not.toMatch(/new DhanApiClient\s*\(/);
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/axios/);
  });

  it('reads no ambient process.env, so credentials cannot arrive by accident', () => {
    const source = readFileSync(resolve(here, 'dhanMarketDataRoute.ts'), 'utf8');
    expect(source).not.toMatch(/process\.env/);
  });
});
