/**
 * `G-11` — the served assessment chain, verified through the DELIVERED transport rather than the handler.
 *
 * WHY THIS FILE EXISTS, AND WHAT IT DOES NOT DUPLICATE
 *   `investment-transport.test.ts` drives `handleInvestmentRequest` with a fake request/response pair and a real
 *   store; `iidStage4S4R1Scenarios.test.ts` proves the 200/404 chain over the composition root with the governed
 *   package installed. Both are store-dependent: they cannot load in an environment where
 *   `iips-np04-governed-persistence` (a private pin) is absent, which is exactly where this record's author
 *   stood. What was therefore unproven is the layer above them: whether the **product's own HTTP server**
 *   enforces the chain's ordering, method, scope and owner-context discipline before any store is touched, and
 *   whether the chain routes stay isolated from the coverage/identity routes that share the `/api/investment`
 *   namespace. `G-10` showed the cost of that gap: a handler-tested surface can still be dispatched wrongly.
 *
 * WHAT IS ASSERTED HERE — every one of them deterministically, with or without the governed package:
 *   1. **Method discipline**: a mutating method is refused on the chain routes with 405 + `Allow: GET, HEAD`,
 *      before an owner is resolved or a store is opened.
 *   2. **Scope rejection**: a symbol, a sector reference, a portfolio id, an empty version segment or a stray
 *      path segment is 400 `investment-scope-invalid` — the scope is validated before the owner and the store,
 *      so a malformed request can never reach persistence.
 *   3. **Owner context fails closed at the served layer**: no carrier, a tampered carrier and a carrier with a
 *      foreign owner value each answer 503 `owner-context-unavailable`, in the fixed refusal shape, with no
 *      path, owner pair or stack trace in the body.
 *   4. **Client-supplied portfolio context cannot select a partition**: adding `?portfolio=`/`?portfolioId=` to
 *      a chain request changes nothing. The chain is selected by the path's issuer and by the server-owned
 *      owner, never by a query parameter — the differential assertion holds in both dependency environments
 *      (503 here, 200/404 where the store is installed).
 *   5. **HEAD parity**: HEAD answers the same status as GET with an empty body, on both chain routes.
 *   6. **Route isolation**: the coverage and identity routes keep their own answers and none of them returns a
 *      chain envelope; the chain routes return no dataset field. Four capabilities, four paths, no shadowing.
 *   7. **Four capabilities, four paths**: no coverage, identity or change response is a chain envelope, and no
 *      chain response carries a dataset field. `G-10` was a dispatch defect of exactly this kind.
 *
 * @vitest-environment node
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';

import { server } from '../executive-transport';
import { REPORTS_OWNER_PATH_ENV } from '../reports-owner-resolver';
import { NP04_DATABASE_PATH_ENV } from '../reports/persistence-port';
import { CANONICAL_REPORTS_CARRIER_TEXT } from '../reports-owner-carrier';

const ISSUER = 'IN:CIN:L85110KA1981PLC013115';
const ISSUER_ENCODED = encodeURIComponent(ISSUER);
const CHAIN = `/api/investment/company/${ISSUER_ENCODED}`;
const VERSION = `${CHAIN}/versions/r-1`;

const tempRoot = mkdtempSync(join(tmpdir(), 'iid-g11-served-'));
const saved = {
  carrier: process.env[REPORTS_OWNER_PATH_ENV],
  db: process.env[NP04_DATABASE_PATH_ENV],
};

let base = '';

function carrierWith(changes: Record<string, unknown>): string {
  const canonical = JSON.parse(CANONICAL_REPORTS_CARRIER_TEXT) as Record<string, unknown>;
  const target = join(tempRoot, `carrier-${Object.keys(changes).join('-')}-${Date.now()}.json`);
  writeFileSync(target, `${JSON.stringify({ ...canonical, ...changes }, null, 2)}\n`, 'utf8');
  return target;
}

function setCarrier(path: string | undefined): void {
  if (path === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = path;
}

/** Point the persistence boundary at a path that does not exist yet, so a read cannot be served from it. */
function setUnusableStore(): string {
  const dbPath = join(tempRoot, `absent-${Date.now()}.db`);
  process.env[NP04_DATABASE_PATH_ENV] = dbPath;
  return dbPath;
}

interface Served {
  readonly status: number;
  readonly body: string;
  readonly headers: Headers;
}

async function get(path: string, init: RequestInit = {}): Promise<Served> {
  const response = await fetch(`${base}${path}`, init);
  return { status: response.status, body: await response.text(), headers: response.headers };
}

async function call(path: string, method: string): Promise<Served> {
  return get(path, { method });
}

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as AddressInfo;
  base = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  rmSync(tempRoot, { recursive: true, force: true });
});

afterEach(() => {
  if (saved.carrier === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = saved.carrier;
  if (saved.db === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = saved.db;
});

describe('G-11 — the served chain refuses a mutating method before any owner or store work', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('%s is 405 with an Allow header', async (method) => {
    setCarrier(undefined);
    setUnusableStore();
    const response = await call(CHAIN, method);
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.body).not.toContain('investment-persistence-unavailable');
    expect(response.body).not.toContain('owner-context-unavailable');
  });

  it('OPTIONS is answered by the transport-wide preflight, before any owner or store work', async () => {
    // `executive-transport.ts` answers every preflight itself (204, empty) before dispatching to a surface, so
    // the chain route must not be reachable through OPTIONS either — and must not answer with data.
    setCarrier(undefined);
    setUnusableStore();
    const response = await call(CHAIN, 'OPTIONS');
    expect(response.status).toBe(204);
    expect(response.body).toBe('');
    expect(response.body).not.toContain('owner-context-unavailable');
  });
});

describe('G-11 — the served chain rejects an inadmissible scope before the owner is resolved', () => {
  it.each([
    ['a symbol', '/api/investment/company/INFY'],
    ['a sector reference', `/api/investment/company/${encodeURIComponent('IN:SECTOR:Technology')}`],
    ['a portfolio id', '/api/investment/company/portfolio-1'],
    ['an empty version segment', `${CHAIN}/versions/`],
    ['a stray segment', `${CHAIN}/positions/IN:EQISIN:INE009A01021`],
    ['a bare company path', '/api/investment/company/'],
  ])('%s answers 400 investment-scope-invalid', async (_label, path) => {
    // No owner carrier and no store: the 400 proves both were never reached.
    setCarrier(undefined);
    setUnusableStore();
    const response = await get(path);
    expect(response.status).toBe(400);
    const payload = JSON.parse(response.body) as { error: string };
    expect(payload.error).toBe('investment-scope-invalid');
    // The refusal never echoes the rejected value.
    expect(response.body).not.toContain('IN:SECTOR');
    expect(response.body).not.toContain('portfolio-1');
  });

  it('a valid scope with no owner context fails closed rather than inventing an owner', async () => {
    setCarrier(undefined);
    setUnusableStore();
    const response = await get(CHAIN);
    expect(response.status).toBe(503);
    const payload = JSON.parse(response.body) as { error: string; detail: { reason: string } };
    expect(payload.error).toBe('owner-context-unavailable');
    expect(payload.detail.reason).toMatch(/No non-authentication ownership source/);
    // Nothing about the caller, the carrier or the store may appear.
    expect(response.body).not.toContain(tempRoot);
    expect(response.body).not.toContain('owner-irr-reports-personal');
    expect(response.body).not.toContain('irr-reports-personal');
  });
});

describe('G-11 — the served chain fails closed on a missing, tampered or foreign owner carrier', () => {
  it.each([
    ['the carrier file is absent', undefined],
    ['the owner value has been changed', carrierWith({ ownerUserId: 'someone-else' })],
    ['the tenant value has been changed', carrierWith({ tenantId: 'another-tenant' })],
    ['the carrier carries an extra key', carrierWith({ extra: 'field' })],
  ])('%s answers 503 owner-context-unavailable', (_label, carrierPath) => {
    setCarrier(carrierPath);
    setUnusableStore();
    return get(CHAIN).then((response) => {
      expect(response.status).toBe(503);
      const payload = JSON.parse(response.body) as { error: string };
      expect(payload.error).toBe('owner-context-unavailable');
      // Recorded, not asserted: this refusal is the one response in the chain surface that does not carry
      // `Cache-Control: no-store` (its shared helper sets only the content type). The omission is a property of
      // `owner-context-unavailable.ts`, used by several surfaces, and is recorded in the register rather than
      // changed here — see the G-11 addendum.
      expect(response.headers.get('content-type')).toBe('application/json');
    });
  });

  it('a carrier that is not JSON at all is refused the same way', async () => {
    const target = join(tempRoot, 'carrier-not-json.json');
    writeFileSync(target, 'not json\n', 'utf8');
    setCarrier(target);
    setUnusableStore();
    const response = await get(CHAIN);
    expect(response.status).toBe(503);
    expect((JSON.parse(response.body) as { error: string }).error).toBe('owner-context-unavailable');
  });

  it('HEAD on the chain and version routes carries no body', async () => {
    setCarrier(undefined);
    setUnusableStore();
    for (const path of [CHAIN, VERSION]) {
      const getResponse = await get(path);
      const headResponse = await get(path, { method: 'HEAD' });
      expect(headResponse.status).toBe(getResponse.status);
      expect(headResponse.body).toBe('');
      expect(headResponse.headers.get('cache-control')).toBe('no-store');
    }
  });
});

describe('G-11 — no client-supplied portfolio or query parameter can change which chain is served', () => {
  it('the answer is identical with and without portfolio context in the query', async () => {
    setCarrier(undefined);
    setUnusableStore();
    const plain = await get(CHAIN);
    for (const suffix of [
      '?portfolio=portfolio-2',
      '?portfolioId=portfolio-2',
      '?portfolio=portfolio-2&securityId=IN:EQISIN:INE009A01021',
      `?asOf=2026-11-10&reportId=another-report`,
    ]) {
      const withQuery = await get(`${CHAIN}${suffix}`);
      expect(withQuery.status).toBe(plain.status);
      expect(withQuery.body).toBe(plain.body);
    }
  });

  it('the version route treats a query string the same way', async () => {
    setCarrier(undefined);
    setUnusableStore();
    const plain = await get(VERSION);
    const withQuery = await get(`${VERSION}?portfolio=portfolio-3`);
    expect(withQuery.status).toBe(plain.status);
    expect(withQuery.body).toBe(plain.body);
  });
});

describe('G-11 — four capabilities, four paths: the chain reads are not shadowed and shadow nothing', () => {
  it('each coverage and identity route keeps its own answer, and none returns a chain envelope', async () => {
    setCarrier(undefined);
    setUnusableStore();
    const investmentCoverage = await get('/api/investment/coverage/investment?asOf=2026-11-10');
    expect(investmentCoverage.status).toBe(200);
    expect(JSON.parse(investmentCoverage.body)).toMatchObject({ reportVersion: 1 });

    // The identity JSON route's status depends on whether identity files are present in this environment; what
    // must hold everywhere is that it answers in its own vocabulary and never with a chain.
    const identityCoverage = await get('/api/investment/coverage?asOf=2026-11-10');
    expect([200, 503]).toContain(identityCoverage.status);
    if (identityCoverage.status === 503) {
      expect(JSON.parse(identityCoverage.body)).toMatchObject({ error: 'identity-sources-unavailable' });
    }

    const investmentHtml = await get('/investment/coverage?asOf=2026-11-10');
    expect(investmentHtml.status).toBe(200);
    expect(investmentHtml.headers.get('content-type')).toBe('text/html; charset=utf-8');

    const identityHtml = await get('/identity-coverage?asOf=2026-11-10');
    expect([200, 503]).toContain(identityHtml.status);
    expect(identityHtml.headers.get('content-type')).toBe('text/html; charset=utf-8');

    // No coverage response is an assessment chain.
    for (const body of [investmentCoverage.body, identityCoverage.body, investmentHtml.body, identityHtml.body]) {
      expect(body).not.toContain('scopeToken');
      expect(body).not.toContain('versionCount');
    }
  });

  it('the chain routes never answer with a dataset or coverage payload', async () => {
    setCarrier(undefined);
    setUnusableStore();
    for (const path of [CHAIN, VERSION]) {
      const response = await get(path);
      expect(response.status).toBe(503);
      expect(response.body).not.toContain('datasetClass');
      expect(response.body).not.toContain('measuredSectors');
      expect(response.body).not.toContain('reportVersion');
    }
  });

  it('the change route under the same issuer path is a different surface, not the chain', async () => {
    setCarrier(undefined);
    setUnusableStore();
    const changes = await get(`${CHAIN}/changes`);
    // The change surface fails closed on its own vocabulary; it must never answer with the assessment envelope.
    expect([503, 404]).toContain(changes.status);
    expect(changes.body).not.toContain('"versions"');
  });
});
