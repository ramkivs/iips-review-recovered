/**
 * IID Stage 2, work item 7 — the SERVED identity-coverage route over the identity set Stage 2 published.
 *
 * WHAT THIS PROVES, AND WHY IT IS A SEPARATE PROOF
 *   `identityProvision.test.ts` proves the provisioner writes three files that the loader accepts. That is not
 *   the same as proving the product SERVES those files. This test closes the gap end to end: it publishes with
 *   the real Stage 2 CLI, then starts a real HTTP server on the real transport and issues real requests.
 *
 *   1. `GET /api/investment/coverage?asOf=…` answers **200** over the published set — the page is live, not 503.
 *   2. The served report names the COMPOSED roster label the provisioner wrote, and `OPERATOR_SUPPLIED`. A
 *      fixture label or a synthetic class reaching the browser would be a governance breach, so both are pinned.
 *   3. Every observation derived from the published roster and listing map resolves, through BOTH resolution
 *      paths (ISIN and exchange/symbol) — the paths Stage 2's probe exercises, now exercised by the server.
 *   4. An observation the published set cannot resolve is reported as UNRESOLVED with a reason, never dropped
 *      and never silently counted as resolved.
 *   5. The served route performs **NO WRITES**: the identity directory is byte-identical before and after.
 *   6. Removing the published set makes the SAME server fail closed with 503 and `IDENTITY_SOURCE_MISSING`.
 *      The route must not degrade to an empty 200 that looks like full coverage.
 *   7. The HTML view answers 200 on the same published set, so the page the operator actually opens is live.
 *
 * @vitest-environment node
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import http from 'node:http';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import type { AddressInfo } from 'node:net';

import { handleInvestmentCoverageRequest } from './coverage-transport';
import { run as provision } from '../../../iips-platform/src/investment/cli/provision-identity';
import { IDENTITY_FILE_NAMES } from '../../../iips-platform/src/investment/identity/sources';
import type { IdentityCoverageReport } from '../../../iips-platform/src/investment/identity/coverage';
import type { IdentityObservation } from '../../../iips-platform/src/investment/identity/types';

const ROOT = join(__dirname, '..', '..', '..');
const EVIDENCE = join(ROOT, 'evidence', 'real-issuer');
const AS_OF = '2026-11-12';

/** The three bundles the owner admitted as operational sources (decision O3). */
const ADMITTED = [
  join(EVIDENCE, 'REL-1-INFOSYS-2026-11-06', 'identity'),
  join(EVIDENCE, 'WI7-CONSUMER-MARICO-2026-11-07', 'ingest-input', 'identity'),
  join(EVIDENCE, 'WI8-INDUSTRIALS-KEC-2026-11-07', 'ingest-input', 'identity'),
];

/** Facts Stage 2 established from those bundles; asserted here so the served page cannot drift from them. */
const ADMITTED_ISIN = ['INE009A01021', 'INE196A01026', 'INE389H01022'];
const ADMITTED_CIN = ['L85110KA1981PLC013115', 'L15140MH1988PLC049208', 'L45200MH2005PLC152061'];

const servers: http.Server[] = [];
const roots: string[] = [];

afterAll(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
  for (const dir of roots.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function freshDataRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), 'iid-stage2-served-'));
  roots.push(dir);
  return dir;
}

/** Publish with the REAL Stage 2 CLI, so what is served is exactly what the operator would publish. */
function publishAdmitted(dataRoot: string): void {
  const argv = [...ADMITTED.flatMap((dir) => ['--source', dir]), '--data-root', dataRoot, '--execute'];
  const code = provision(argv);
  expect(code, 'the provisioner must publish the admitted set').toBe(0);
}

function identityDir(dataRoot: string): string {
  return join(dataRoot, 'investment', 'identity');
}

/** A snapshot of the published set: name, size and modification time of every file present. */
function snapshot(dir: string): string[] {
  return readdirSync(dir)
    .sort()
    .map((name) => {
      const stats = statSync(join(dir, name));
      return `${name} ${stats.size} ${stats.mtimeMs}`;
    });
}

/** The published roster issuers and the published listing-map ENTRIES (its root key is `entries`, not `listings`). */
function readPublished(dataRoot: string): {
  issuers: readonly PublishedIssuer[];
  entries: readonly PublishedListingEntry[];
} {
  const dir = identityDir(dataRoot);
  const roster = JSON.parse(readFileSync(join(dir, IDENTITY_FILE_NAMES.roster), 'utf8')) as {
    issuers: readonly PublishedIssuer[];
  };
  const listingMap = JSON.parse(readFileSync(join(dir, IDENTITY_FILE_NAMES.listingMap), 'utf8')) as {
    entries: readonly PublishedListingEntry[];
  };
  return { issuers: roster.issuers, entries: listingMap.entries };
}

interface PublishedIssuer {
  readonly issuerId: string;
  readonly cin: string | null;
  readonly equityIsin: string | null;
  readonly legalName: string;
  readonly sector: string;
}

interface PublishedListingEntry {
  readonly listingId: string;
  readonly issuerId: string;
  readonly securityId: string | null;
  readonly exchange: string;
  readonly symbol: string;
  readonly series: string | null;
}

/**
 * Observations derived from the PUBLISHED files, not from the test's own expectations. One HOLDING per issuer
 * (by ISIN, exercising the ISIN path) and one WATCHLIST per listing entry (by exchange/symbol, exercising the
 * exchange/symbol path) — the same two paths Stage 2's probe exercises, arriving through the served route.
 */
function observationsFromPublished(dataRoot: string): IdentityObservation[] {
  const { issuers, entries } = readPublished(dataRoot);
  const out: IdentityObservation[] = [];
  issuers.forEach((issuer, index) => {
    out.push({
      observationId: `holding-${index}`,
      source: 'HOLDING',
      isin: issuer.equityIsin,
      symbol: null,
      exchange: null,
      series: null,
      cin: issuer.cin,
      companyIdHint: null,
      displayName: null,
      portfolioId: null,
      quantity: 1,
      upstreamStatus: null,
      raw: { isin: issuer.equityIsin, cin: issuer.cin, issuerId: issuer.issuerId },
    });
  });
  entries.forEach((entry, index) => {
    out.push({
      observationId: `watchlist-${index}`,
      source: 'WATCHLIST',
      isin: null,
      symbol: entry.symbol,
      exchange: entry.exchange,
      series: entry.series,
      cin: null,
      companyIdHint: null,
      displayName: null,
      portfolioId: null,
      quantity: null,
      upstreamStatus: null,
      raw: { listingId: entry.listingId, exchange: entry.exchange, symbol: entry.symbol },
    });
  });
  return out;
}

async function startServer(dataRoot: string, extra: readonly IdentityObservation[] = []): Promise<string> {
  const server = http.createServer((req, res) => {
    void handleInvestmentCoverageRequest(req, res, {
      dataRoot,
      holdings: async () => observationsFromPublished(dataRoot).filter((o) => o.source === 'HOLDING'),
      watchlist: async () => [
        ...observationsFromPublished(dataRoot).filter((o) => o.source === 'WATCHLIST'),
        ...extra,
      ],
    });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

describe('IID Stage 2 — the served identity-coverage route over the published set', () => {
  let dataRoot: string;

  beforeEach(() => {
    dataRoot = freshDataRoot();
    publishAdmitted(dataRoot);
  });

  it('answers 200 with a report built from the files Stage 2 published', async () => {
    const url = await startServer(dataRoot);
    const response = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/application\/json/);

    const body = (await response.json()) as IdentityCoverageReport;
    expect(body.reportVersion).toBe(1);
    expect(body.asOf).toBe(AS_OF);

    // The composed label the provisioner wrote must be what the browser receives. A per-bundle label here would
    // mean the merge did not happen, or that a different set is being served.
    expect(body.identitySources.rosterLabel).toBe(
      'Merged from 3 operator-supplied identity source set(s): '
        + 'REL-1-INFOSYS-2026-11-06, WI7-CONSUMER-MARICO-2026-11-07, WI8-INDUSTRIALS-KEC-2026-11-07',
    );
    expect(body.identitySources.rosterDataClass).toBe('OPERATOR_SUPPLIED');
    for (const version of [
      body.identitySources.rosterVersion,
      body.identitySources.listingMapVersion,
      body.identitySources.corporateActionTableVersion,
    ]) {
      expect(version).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it('resolves every observation derived from the published set, through both resolution paths', async () => {
    const url = await startServer(dataRoot);
    const response = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as IdentityCoverageReport;

    // 3 issuers by ISIN + 5 listings by exchange/symbol = 8 observations, all resolved.
    expect(body.counts.observed).toBe(8);
    expect(body.counts.RESOLVED).toBe(8);
    expect(body.unresolved).toEqual([]);

    const isinItems = body.items.filter((item) => item.resolution.resolutionBasis === 'ISIN');
    const symbolItems = body.items.filter((item) => item.resolution.resolutionBasis === 'EXCHANGE_SYMBOL');
    expect(isinItems).toHaveLength(3);
    expect(symbolItems).toHaveLength(5);

    // The ISIN path must have reached the three admitted ISINs, and nothing else.
    expect(isinItems.map((item) => item.resolution.securityId).sort()).toEqual(
      ADMITTED_ISIN.map((isin) => `IN:ISIN:${isin}`).sort(),
    );
    // And the issuers behind them must be the three admitted CINs.
    expect(isinItems.map((item) => item.resolution.issuerId).sort()).toEqual(
      ADMITTED_CIN.map((cin) => `IN:CIN:${cin}`).sort(),
    );
    // The exchange/symbol path must name real listing ids from the published listing map.
    for (const item of symbolItems) {
      expect(item.resolution.listingId).toMatch(/^IN:(NSE|BSE):[A-Z0-9&-]{1,32}:EQ:EQUITY$/);
      expect(item.resolution.issuerId).toMatch(/^IN:CIN:[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/);
    }
  });

  it('reports an observation the published set cannot resolve as UNRESOLVED, with a reason', async () => {
    // A real ISIN that is simply not in the admitted set: it must surface as unresolved, never be dropped and
    // never be counted as resolved. Fabricating a "close enough" match would be the failure mode here.
    const unknown: IdentityObservation = {
      observationId: 'watchlist-unknown',
      source: 'WATCHLIST',
      isin: 'INE002A01018',
      symbol: null,
      exchange: null,
      series: null,
      cin: null,
      companyIdHint: null,
      displayName: null,
      portfolioId: null,
      quantity: null,
      upstreamStatus: null,
      raw: { isin: 'INE002A01018' },
    };
    const url = await startServer(dataRoot, [unknown]);
    const response = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(response.status, 'an unresolved observation is a reportable fact, not a server fault').toBe(200);
    const body = (await response.json()) as IdentityCoverageReport;

    expect(body.counts.observed).toBe(9);
    expect(body.counts.RESOLVED).toBe(8);
    expect(body.unresolved).toHaveLength(1);
    const item = body.unresolved[0]!;
    expect(item.observationId).toBe('watchlist-unknown');
    expect(item.state).not.toBe('RESOLVED');
    expect(item.reason).toBeTruthy();
    expect(item.reasonText).toBeTruthy();
    expect(item.resolution.issuerId).toBeNull();
    // The raw row is carried verbatim beside the unresolved state, so the operator can see what was offered.
    expect(item.raw.isin).toBe('INE002A01018');
  });

  it('performs NO WRITES: the published set is byte-identical after serving', async () => {
    const dir = identityDir(dataRoot);
    const before = snapshot(dir);
    const beforeBytes = Object.values(IDENTITY_FILE_NAMES).map((name) => readFileSync(join(dir, name), 'utf8'));
    expect(before).toHaveLength(3);

    const url = await startServer(dataRoot);
    await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    await fetch(`${url}/investment/coverage?asOf=${AS_OF}`);
    await fetch(`${url}/api/investment/coverage/investment?asOf=${AS_OF}`);

    expect(snapshot(dir)).toEqual(before);
    expect(Object.values(IDENTITY_FILE_NAMES).map((name) => readFileSync(join(dir, name), 'utf8')))
      .toEqual(beforeBytes);
    // No staging or previous marker may appear as a side effect of serving.
    expect(readdirSync(dir).filter((name) => name.includes('.iips-'))).toEqual([]);
  });

  it('fails closed with 503 once the published set is gone, naming the missing files', async () => {
    const url = await startServer(dataRoot);
    // The server is already running and healthy; only the data changes underneath it.
    const healthy = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(healthy.status).toBe(200);

    for (const name of Object.values(IDENTITY_FILE_NAMES)) rmSync(join(identityDir(dataRoot), name));

    const response = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string; issues: readonly { code: string }[] };
    expect(body.error).toBe('identity-sources-unavailable');
    expect(body.issues.map((issue) => issue.code)).toContain('IDENTITY_SOURCE_MISSING');
    // It must NOT answer 200 with an empty report, which would read as full coverage of nothing.
    expect(response.status).not.toBe(200);
  });

  it('serves the HTML view the operator actually opens, over the same published set', async () => {
    const url = await startServer(dataRoot);
    const response = await fetch(`${url}/investment/coverage?asOf=${AS_OF}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/text\/html/);
    const html = await response.text();
    expect(html).toContain('Merged from 3 operator-supplied identity source set(s)');
    expect(html).not.toContain('SYNTHETIC');
  });

  it('rejects a malformed asOf rather than defaulting to today behind the operator\'s back', async () => {
    const url = await startServer(dataRoot);
    const response = await fetch(`${url}/api/investment/coverage?asOf=12-11-2026`);
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string; detail: string };
    expect(body.error).toBe('invalid-asOf');
    expect(body.detail).toContain('12-11-2026');
  });

  it('a fault on an observation surface fails closed rather than serving an empty, fully-covered report', async () => {
    // Discovered empirically while writing this test: a provider that throws produced a 503, NOT a 200 with zero
    // observations. That is the right behaviour and it is pinned here, because the alternative — an empty report
    // served as success — reads on the page as "everything is covered" when nothing was observed at all.
    const server = http.createServer((req, res) => {
      void handleInvestmentCoverageRequest(req, res, {
        dataRoot,
        holdings: async () => {
          throw new Error('IPD surface unavailable');
        },
        watchlist: async () => observationsFromPublished(dataRoot).filter((o) => o.source === 'WATCHLIST'),
      });
    });
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const response = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string; issues: readonly string[] };
    expect(body.error).toBe('observation-sources-unavailable');
    expect(JSON.stringify(body.issues)).toContain('holdings');
    // The identity sources loaded fine; the failure is named as the observation surface, not as the identity set.
    expect(body.error).not.toBe('identity-sources-unavailable');
  });

  it('serves the published set from a nested data root whose path contains a space', async () => {
    // Windows paths routinely contain spaces (`C:\Users\First Last\iips-data`). A transport that split on
    // whitespace would break here, so the same proof is repeated on such a path.
    const spaced = freshDataRoot();
    const withSpace = join(spaced, 'iips data root');
    const argv = [...ADMITTED.flatMap((dir) => ['--source', dir]), '--data-root', withSpace, '--execute'];
    expect(provision(argv)).toBe(0);
    expect(identityDir(withSpace).includes(`${sep}investment${sep}identity`)).toBe(true);

    const url = await startServer(withSpace);
    const response = await fetch(`${url}/api/investment/coverage?asOf=${AS_OF}`);
    expect(response.status).toBe(200);
    const body = (await response.json()) as IdentityCoverageReport;
    expect(body.counts.RESOLVED).toBe(8);
    expect(body.identitySources.rosterDataClass).toBe('OPERATOR_SUPPLIED');
  });
});
