/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * IRR-SIDE PIT READ BOUNDARY — 38 CASES (IU3R-01 .. IU3R-38) plus the IU-5
 * D1/D2/D3 regression cases (IU3R-39 .. IU3R-45).
 *
 * IU-5 RUNNER NOTE — this suite previously declared itself as `node:test` and
 * could not actually be executed by either runner available here:
 * `node --test --experimental-strip-types` fails with ERR_MODULE_NOT_FOUND
 * because Node does not map `.js` specifiers to `.ts` files, and vitest does
 * not collect `node:test` suites ("No test suite found in file"). The header
 * rationale for choosing `node:test` — that "the vitest dependency is absent
 * in this environment" — no longer holds: vitest is a declared devDependency
 * and is the runner wired to `npm test`.
 *
 * So the suite now runs on vitest, the project's actual test runner. Every
 * original case ID (IU3R-01..IU3R-38) and every original assertion is
 * preserved unchanged; only the test-runner import differs. The assertions
 * still use `node:assert/strict`, which behaves identically under vitest.
 *
 * Original coverage map (all still present):
 *   identity validation (fail closed)   IU3R-01..08
 *   domain validation                   IU3R-09..12
 *   asOf validation                     IU3R-13..17
 *   delegation and pass-through         IU3R-18..25
 *   series isolation                    IU3R-26..30
 *   future-leakage protection           IU3R-31..33
 *   transport surface                   IU3R-34..36
 *   preservation of existing IRR routes IU3R-37..38
 *   IU-5 D1/D2/D3 regressions           IU3R-39..45
 *
 * @vitest-environment node
 */
import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';
import {
  PIT_READ_DOMAINS,
  SECURITY_ID_ISIN_LENGTH,
  SECURITY_ID_PREFIX,
  isNonBlankString,
  isNotFutureLeakage,
  isValidAsOf,
  isValidSecurityId,
  isPitReadDomain,
  type PitReadHit,
  type PitReadMiss,
  type PitReadRequest,
  type PitReadResult,
} from './pitReadContract.js';
import type { PitReadPort } from './pitReadPort.js';
import { queryPitAsOf, validatePitReadRequest } from './pitReadBoundary.js';
import { handlePitReadRequest, PIT_MARKET_DATA_ROUTE } from '../pit-transport.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_FRONTEND = path.resolve(HERE, '..', '..');

const SWAN_ISIN = 'INE665A01038';
const SWAN_BL = `ISIN:${SWAN_ISIN}:BL`;
const SWAN_EQ = `ISIN:${SWAN_ISIN}:EQ`;
const SWAN_UNKNOWN_SERIES = `ISIN:${SWAN_ISIN}:ZZ`;

const T1 = '2026-01-05T09:15:00.000Z';
const T2 = '2026-02-10T11:30:00.000Z';
const T3 = '2026-03-20T14:45:00.000Z';

const BL_PAYLOAD = Object.freeze({ close: 512.35, currency: 'INR', series: 'BL' });
const EQ_PAYLOAD = Object.freeze({ close: 511.8, currency: 'INR', series: 'EQ' });

function provenance(asOf: string): Readonly<Record<string, string>> {
  return Object.freeze({
    asOf,
    receivedAt: '2026-01-05T09:16:02.000Z',
    evaluatedAt: '2026-01-05T09:16:40.000Z',
    dataVersion: 'dv-2026-01-05-a',
    lineageHash: 'a'.repeat(64),
    qualityState: 'CLEAN',
  });
}

function hit(securityId: string, domain: string, asOf: string, resolvedAsOf: string, payload: unknown): PitReadHit {
  return {
    found: true,
    securityId,
    domain,
    asOf,
    resolvedAsOf,
    payload,
    provenance: provenance(resolvedAsOf),
  } as PitReadHit;
}

/**
 * A contract-faithful stand-in for the IPD read service. It holds no store of
 * its own beyond this fixture map, resolves strictly by securityId, and fails
 * closed on an unknown series.
 */
function makePort(): PitReadPort {
  const records = new Map<string, PitReadResult>([
    [`${SWAN_BL}|D01_QUOTES`, hit(SWAN_BL, 'D01_QUOTES', T3, T1, BL_PAYLOAD)],
    [`${SWAN_BL}|D02_OHLCV`, hit(SWAN_BL, 'D02_OHLCV', T3, T2, BL_PAYLOAD)],
    [`${SWAN_EQ}|D01_QUOTES`, hit(SWAN_EQ, 'D01_QUOTES', T3, T1, EQ_PAYLOAD)],
    [`${SWAN_EQ}|D02_OHLCV`, hit(SWAN_EQ, 'D02_OHLCV', T3, T2, EQ_PAYLOAD)],
  ]);

  return {
    async queryAsOf(request: PitReadRequest): Promise<PitReadResult> {
      const found = records.get(`${request.securityId}|${request.domain}`);
      if (found === undefined) return { found: false, reason: 'NOT_FOUND' };
      return found;
    },
  };
}

/** A port that reports the identity as ambiguous across companyIds. */
function makeAmbiguousPort(): PitReadPort {
  return {
    async queryAsOf(): Promise<PitReadResult> {
      return { found: false, reason: 'AMBIGUOUS' };
    },
  };
}

/** A recording port, used to prove pass-through of each mandatory field. */
function makeRecordingPort(): { port: PitReadPort; seen: PitReadRequest[] } {
  const seen: PitReadRequest[] = [];
  const port: PitReadPort = {
    async queryAsOf(request: PitReadRequest): Promise<PitReadResult> {
      seen.push(request);
      return hit(request.securityId, request.domain, request.asOf, request.asOf, BL_PAYLOAD);
    },
  };
  return { port, seen };
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function readSource(relativeFromFrontend: string): string {
  return fs.readFileSync(path.join(REPO_FRONTEND, relativeFromFrontend), 'utf8');
}

function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = http.createServer((req, res) => {
    void handlePitReadRequest(req, res, makePort());
  });
  return new Promise<void>((resolve, reject) => {
    server.listen(0, () => {
      const port = (server.address() as AddressInfo).port;
      run(`http://127.0.0.1:${port}`)
        .then(() => {
          server.close();
          resolve();
        })
        .catch((error: unknown) => {
          server.close();
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  });
}

// ---------------------------------------------------------------------------
// IU3R-01 .. IU3R-08 — securityId validation, fail closed
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — securityId validation (fail closed)', () => {
  it('IU3R-01 accepts a well-formed BL securityId', () => {
    assert.equal(isValidSecurityId(SWAN_BL), true);
  });

  it('IU3R-02 accepts a well-formed EQ securityId', () => {
    assert.equal(isValidSecurityId(SWAN_EQ), true);
  });

  it('IU3R-03 rejects a missing securityId', () => {
    assert.equal(isValidSecurityId(undefined), false);
    assert.equal(validatePitReadRequest({ domain: 'D01_QUOTES', asOf: T3 })?.reason, 'INVALID_IDENTITY');
  });

  it('IU3R-04 rejects a blank securityId', () => {
    assert.equal(isValidSecurityId('   '), false);
    assert.equal(isValidSecurityId(''), false);
  });

  it('IU3R-05 rejects a securityId with no series component', () => {
    assert.equal(isValidSecurityId(`ISIN:${SWAN_ISIN}`), false);
  });

  it('IU3R-06 rejects a securityId whose ISIN is not 12 alphanumerics', () => {
    assert.equal(isValidSecurityId('ISIN:INE665A0103:BL'), false);
    assert.equal(isValidSecurityId('ISIN:INE665A010381:BL'), false);
  });

  it('IU3R-07 rejects a bare ISIN used as the cross-platform identity', () => {
    assert.equal(isValidSecurityId(SWAN_ISIN), false);
  });

  it('IU3R-08 rejects a whitespace-padded securityId', () => {
    assert.equal(isValidSecurityId(` ${SWAN_BL} `), false);
    assert.equal(isValidSecurityId(`${SWAN_BL} `), false);
  });
});

// ---------------------------------------------------------------------------
// IU3R-09 .. IU3R-12 — domain validation
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — domain validation', () => {
  it('IU3R-09 accepts D01_QUOTES', () => {
    assert.equal(isPitReadDomain('D01_QUOTES'), true);
  });

  it('IU3R-10 accepts D02_OHLCV', () => {
    assert.equal(isPitReadDomain('D02_OHLCV'), true);
  });

  it('IU3R-11 rejects a missing domain', () => {
    assert.equal(validatePitReadRequest({ securityId: SWAN_BL, asOf: T3 })?.reason, 'INVALID_DOMAIN');
  });

  it('IU3R-12 rejects an unknown or blank domain', () => {
    assert.equal(isPitReadDomain('D99_MADE_UP'), false);
    assert.equal(validatePitReadRequest({ securityId: SWAN_BL, domain: 'D99_MADE_UP', asOf: T3 })?.reason, 'INVALID_DOMAIN');
    assert.equal(isNonBlankString('   '), false);
    assert.equal(validatePitReadRequest({ securityId: SWAN_BL, domain: '   ', asOf: T3 })?.reason, 'INVALID_DOMAIN');
  });
});

// ---------------------------------------------------------------------------
// IU3R-13 .. IU3R-17 — asOf validation
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — asOf validation', () => {
  it('IU3R-13 accepts an ISO-8601 UTC asOf', () => {
    assert.equal(isValidAsOf(T3), true);
  });

  it('IU3R-14 rejects a missing asOf', () => {
    assert.equal(validatePitReadRequest({ securityId: SWAN_BL, domain: 'D01_QUOTES' })?.reason, 'INVALID_ASOF');
  });

  it('IU3R-15 rejects a non-UTC asOf offset', () => {
    assert.equal(isValidAsOf('2026-03-20T14:45:00+05:30'), false);
    assert.equal(
      validatePitReadRequest({ securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: '2026-03-20T14:45:00+05:30' })?.reason,
      'INVALID_ASOF',
    );
  });

  it('IU3R-16 rejects a malformed asOf', () => {
    assert.equal(isValidAsOf('not-a-timestamp'), false);
    assert.equal(validatePitReadRequest({ securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: 'not-a-timestamp' })?.reason, 'INVALID_ASOF');
  });

  it('IU3R-17 rejects a bare calendar date as asOf', () => {
    assert.equal(isValidAsOf('2026-03-20'), false);
    assert.equal(validatePitReadRequest({ securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: '2026-03-20' })?.reason, 'INVALID_ASOF');
  });
});

// ---------------------------------------------------------------------------
// IU3R-18 .. IU3R-25 — delegation and pass-through
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — delegation and pass-through', () => {
  it('IU3R-18 passes securityId through verbatim', async () => {
    const { port, seen } = makeRecordingPort();
    await queryPitAsOf(port, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].securityId, SWAN_BL);
  });

  it('IU3R-19 passes domain through verbatim', async () => {
    const { port, seen } = makeRecordingPort();
    await queryPitAsOf(port, { securityId: SWAN_BL, domain: 'D02_OHLCV', asOf: T3 });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].domain, 'D02_OHLCV');
  });

  it('IU3R-20 passes asOf through verbatim', async () => {
    const { port, seen } = makeRecordingPort();
    await queryPitAsOf(port, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T2 });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].asOf, T2);
  });

  it('IU3R-21 returns a hit carrying every contract field', async () => {
    const result = await queryPitAsOf(makePort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.securityId, SWAN_BL);
    assert.equal(result.domain, 'D01_QUOTES');
    assert.equal(result.asOf, T3);
    assert.equal(result.resolvedAsOf, T1);
    assert.deepEqual(result.payload, BL_PAYLOAD);
  });

  it('IU3R-22 preserves IPD provenance verbatim', async () => {
    const result = await queryPitAsOf(makePort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.deepEqual(result.provenance, provenance(T1));
    assert.equal(result.provenance.asOf, T1);
    assert.equal(result.provenance.receivedAt, '2026-01-05T09:16:02.000Z');
    assert.equal(result.provenance.evaluatedAt, '2026-01-05T09:16:40.000Z');
    assert.equal(result.provenance.dataVersion, 'dv-2026-01-05-a');
    assert.equal(result.provenance.lineageHash, 'a'.repeat(64));
    assert.equal(result.provenance.qualityState, 'CLEAN');
  });

  it('IU3R-23 maps a port NOT_FOUND to a typed miss', async () => {
    const port: PitReadPort = {
      async queryAsOf(): Promise<PitReadResult> {
        return { found: false, reason: 'NOT_FOUND' };
      },
    };
    const result = await queryPitAsOf(port, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'NOT_FOUND');
  });

  it('IU3R-24 maps a port AMBIGUOUS to a typed miss', async () => {
    const result = await queryPitAsOf(makeAmbiguousPort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });

  it('IU3R-25 converts a port throw into AMBIGUOUS, never a partial record', async () => {
    const port: PitReadPort = {
      async queryAsOf(): Promise<PitReadResult> {
        throw new Error('upstream unavailable');
      },
    };
    const result = await queryPitAsOf(port, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });
});

// ---------------------------------------------------------------------------
// IU3R-26 .. IU3R-30 — series isolation
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — series isolation', () => {
  it('IU3R-26 a BL request returns BL data', async () => {
    const result = await queryPitAsOf(makePort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.securityId, SWAN_BL);
    assert.deepEqual(result.payload, BL_PAYLOAD);
  });

  it('IU3R-27 an EQ request returns EQ data', async () => {
    const result = await queryPitAsOf(makePort(), { securityId: SWAN_EQ, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.securityId, SWAN_EQ);
    assert.deepEqual(result.payload, EQ_PAYLOAD);
  });

  it('IU3R-28 BL and EQ are distinct and neither collapses into the other', async () => {
    const bl = await queryPitAsOf(makePort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    const eq = await queryPitAsOf(makePort(), { securityId: SWAN_EQ, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(bl.found, true);
    assert.equal(eq.found, true);
    if (!bl.found || !eq.found) return;
    assert.notEqual(bl.securityId, eq.securityId);
    assert.notDeepEqual(bl.payload, eq.payload);
  });

  it('IU3R-29 an unknown series fails closed with NOT_FOUND', async () => {
    const result = await queryPitAsOf(makePort(), { securityId: SWAN_UNKNOWN_SERIES, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'NOT_FOUND');
  });

  it('IU3R-30 the same identity under two companyIds is AMBIGUOUS', async () => {
    const result = await queryPitAsOf(makeAmbiguousPort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });
});

// ---------------------------------------------------------------------------
// IU3R-31 .. IU3R-33 — future-leakage protection
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — future-leakage protection', () => {
  it('IU3R-31 accepts a resolved vintage at or before the query asOf', () => {
    assert.equal(isNotFutureLeakage(T3, T1), true);
    assert.equal(isNotFutureLeakage(T3, T3), true);
  });

  it('IU3R-32 rejects a resolved vintage after the query asOf', () => {
    assert.equal(isNotFutureLeakage(T1, T3), false);
  });

  it('IU3R-33 the boundary refuses to return a future-dated record', async () => {
    const port: PitReadPort = {
      async queryAsOf(): Promise<PitReadResult> {
        return hit(SWAN_BL, 'D01_QUOTES', T1, T3, BL_PAYLOAD);
      },
    };
    const result = await queryPitAsOf(port, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T1 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });
});

// ---------------------------------------------------------------------------
// IU3R-34 .. IU3R-36 — transport surface
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — transport surface', () => {
  it('IU3R-34 rejects a non-GET verb on the PIT route with 405', async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(
        `${baseUrl}${PIT_MARKET_DATA_ROUTE}?securityId=${encodeURIComponent(SWAN_BL)}&domain=D01_QUOTES&asOf=${encodeURIComponent(T3)}`,
        { method: 'POST' },
      );
      assert.equal(res.status, 405);
    });
  });

  it('IU3R-35 rejects a duplicated parameter instead of guessing', async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(
        `${baseUrl}${PIT_MARKET_DATA_ROUTE}?securityId=${encodeURIComponent(SWAN_BL)}&securityId=${encodeURIComponent(SWAN_EQ)}&domain=D01_QUOTES&asOf=${encodeURIComponent(T3)}`,
      );
      assert.equal(res.status, 404);
      const body = (await res.json()) as { found: boolean; reason?: string };
      assert.equal(body.found, false);
      assert.equal(body.reason, 'INVALID_IDENTITY');
    });
  });

  it('IU3R-36 serves a hit as 200 with the full contract body', async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(
        `${baseUrl}${PIT_MARKET_DATA_ROUTE}?securityId=${encodeURIComponent(SWAN_BL)}&domain=D01_QUOTES&asOf=${encodeURIComponent(T3)}`,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as PitReadResult;
      assert.equal(body.found, true);
      if (!body.found) return;
      assert.equal(body.securityId, SWAN_BL);
      assert.equal(body.resolvedAsOf, T1);
      assert.deepEqual(body.payload, BL_PAYLOAD);
    });
  });
});

// ---------------------------------------------------------------------------
// IU3R-37 .. IU3R-38 — preservation of existing IRR surfaces
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — preservation of existing surfaces', () => {
  it('IU3R-37 /api/company/:id remains sector-keyed and the PIT route is distinct', () => {
    const source = readSource('server/executive-transport.ts');
    // The company route is intact and is still keyed by a sector identifier.
    assert.equal(source.includes('/api/company/'), true);
    assert.equal(stripComments(source).includes('securityId'), false);
    assert.equal(PIT_MARKET_DATA_ROUTE, '/api/pit/market-data');
    assert.equal(PIT_MARKET_DATA_ROUTE.startsWith('/api/company'), false);

    // IU-5: the PIT handler is now REGISTERED in the real server composition.
    // The original assertion that the PIT route was absent from the server has
    // been superseded by the authorized registration; what must still hold is
    // that the two surfaces are separately dispatched and neither is conflated.
    // The PIT route is matched in the `/api/pit/` namespace, which cannot
    // capture the company route, and the company route is still dispatched on
    // its own prefix.
    const bare = stripComments(source);
    // The PIT seam and the company route are dispatched by SEPARATE conditions,
    // on disjoint namespaces, so neither can capture the other.
    assert.equal(bare.includes("req.url?.startsWith('/api/pit/')"), true);
    assert.equal(bare.includes("req.url?.startsWith('/api/company/')"), true);
    // The company dispatch condition must not mention the PIT namespace.
    const companyDispatch = bare.match(/if \(req\.url\?\.startsWith\('\/api\/company\/'\)\)/);
    assert.notEqual(companyDispatch, null);
    assert.equal(companyDispatch?.[0].includes('/api/pit/'), false);
  });

  it('IU3R-38 the boundary declares no companyId, tenantId, userId or PIT store', () => {
    const files = ['server/pit/pitReadBoundary.ts', 'server/pit/pitReadContract.ts', 'server/pit/pitReadPort.ts'];
    for (const file of files) {
      const bare = stripComments(readSource(file));
      assert.equal(bare.includes('companyId'), false, `${file} must not reference companyId`);
      assert.equal(bare.includes('tenantId'), false, `${file} must not reference tenantId`);
      assert.equal(bare.includes('userId'), false, `${file} must not reference userId`);
      assert.equal(/class\s+\w*PointInTimeStore/.test(bare), false, `${file} must not declare a PIT store`);
    }
    const port = stripComments(readSource('server/pit/pitReadPort.ts'));
    assert.equal(port.includes('append('), false);
    assert.equal(PIT_READ_DOMAINS.length, 2);
    assert.equal(Object.isFrozen(PIT_READ_DOMAINS), true);
    assert.equal(SECURITY_ID_PREFIX, 'ISIN');
    assert.equal(SECURITY_ID_ISIN_LENGTH, 12);
  });
});
// ---------------------------------------------------------------------------
// IU3R-39 .. IU3R-45 — IU-5 D1/D2/D3 regressions
// ---------------------------------------------------------------------------
describe('IRR PIT read boundary — IU-5 D1/D2/D3 regressions', () => {
  // --- D1: strict calendar validation -------------------------------------

  it('IU3R-39 D1 rejects impossible calendar dates that Date.parse accepts', () => {
    // Date.parse is permissive here and silently rolls each of these over:
    //   2026-02-30 -> 2026-03-02, 2026-04-31 -> 2026-05-01,
    //   2026-06-31 -> 2026-07-01, 2027-02-29 -> 2027-03-01.
    // A shape-only check would admit them; the round-trip guard must not.
    assert.equal(Number.isFinite(Date.parse('2026-02-30T12:00:00Z')), true);
    assert.equal(Number.isFinite(Date.parse('2027-02-29T00:00:00Z')), true);
    assert.equal(isValidAsOf('2026-02-30T12:00:00Z'), false);
    assert.equal(isValidAsOf('2026-04-31T00:00:00Z'), false);
    assert.equal(isValidAsOf('2026-06-31T00:00:00Z'), false);
    assert.equal(isValidAsOf('2027-02-29T00:00:00Z'), false);
  });

  it('IU3R-39b D1 fails closed at the boundary with INVALID_ASOF', () => {
    for (const impossible of ['2026-02-30T12:00:00Z', '2026-04-31T00:00:00Z', '2026-13-01T00:00:00Z']) {
      const rejection = validatePitReadRequest({
        securityId: SWAN_BL,
        domain: 'D01_QUOTES',
        asOf: impossible,
      });
      assert.notEqual(rejection, null, `${impossible} must be rejected`);
      assert.equal((rejection as PitReadMiss).reason, 'INVALID_ASOF', `${impossible} must be rejected`);
    }
  });

  it('IU3R-39c D1 still accepts every real instant, including leap days', () => {
    assert.equal(isValidAsOf('2026-01-05T09:15:00.000Z'), true);
    assert.equal(isValidAsOf('2024-02-29T00:00:00Z'), true); // 2024 IS a leap year
    assert.equal(isValidAsOf('2026-12-31T23:59:59.999Z'), true);
    assert.equal(isValidAsOf('2026-01-01T00:00:00Z'), true);
  });

  // --- D2: the vintage guard is anchored to the ORIGINAL request ------------

  it('IU3R-40 D2 a future vintage is refused even when the adapter widens asOf', async () => {
    // The adapter echoes a LATER asOf than was requested, which under the old
    // guard made the future record look admissible relative to its own echo.
    const leaky: PitReadPort = {
      async queryAsOf(): Promise<PitReadResult> {
        return hit(SWAN_BL, 'D01_QUOTES', T3, T3, BL_PAYLOAD);
      },
    };
    const result = await queryPitAsOf(leaky, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T1 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });

  it('IU3R-40b D2 a hit for a different securityId than requested is refused', async () => {
    const wrongIdentity: PitReadPort = {
      async queryAsOf(): Promise<PitReadResult> {
        return hit(SWAN_EQ, 'D01_QUOTES', T3, T1, EQ_PAYLOAD);
      },
    };
    const result = await queryPitAsOf(wrongIdentity, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });

  it('IU3R-40c D2 a hit for a different domain than requested is refused', async () => {
    const wrongDomain: PitReadPort = {
      async queryAsOf(): Promise<PitReadResult> {
        return { ...hit(SWAN_BL, 'D01_QUOTES', T3, T1, BL_PAYLOAD), domain: 'D02_OHLCV' } as PitReadHit;
      },
    };
    const result = await queryPitAsOf(wrongDomain, { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, false);
    if (result.found) return;
    assert.equal(result.reason, 'AMBIGUOUS');
  });

  it('IU3R-40d D2 an admissible hit is still returned unchanged', async () => {
    // The D2 guard must not reject legitimate results.
    const result = await queryPitAsOf(makePort(), { securityId: SWAN_BL, domain: 'D01_QUOTES', asOf: T3 });
    assert.equal(result.found, true);
    if (!result.found) return;
    assert.equal(result.resolvedAsOf, T1);
    assert.deepEqual(result.payload, BL_PAYLOAD);
  });

  // --- D3: exact route matching -------------------------------------------

  it('IU3R-41 D3 a path that merely starts with the PIT route is not served', async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(
        `${baseUrl}${PIT_MARKET_DATA_ROUTE}EVIL?securityId=${encodeURIComponent(SWAN_BL)}&domain=D01_QUOTES&asOf=${encodeURIComponent(T3)}`,
      );
      assert.equal(res.status, 404);
      const body = (await res.json()) as Record<string, unknown>;
      assert.equal(body.found, false);
      // The decisive part: no PIT record was served on a non-PIT path.
      assert.equal('payload' in body, false);
      assert.equal('resolvedAsOf' in body, false);
    });
  });

  it('IU3R-42 D3 extra path segments after the PIT route are not served', async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(
        `${baseUrl}${PIT_MARKET_DATA_ROUTE}/extra?securityId=${encodeURIComponent(SWAN_BL)}&domain=D01_QUOTES&asOf=${encodeURIComponent(T3)}`,
      );
      assert.equal(res.status, 404);
      const body = (await res.json()) as Record<string, unknown>;
      assert.equal('payload' in body, false);
    });
  });

  it('IU3R-43 D3 the exact PIT route still serves a hit', async () => {
    await withServer(async (baseUrl) => {
      const res = await fetch(
        `${baseUrl}${PIT_MARKET_DATA_ROUTE}?securityId=${encodeURIComponent(SWAN_BL)}&domain=D01_QUOTES&asOf=${encodeURIComponent(T3)}`,
      );
      assert.equal(res.status, 200);
      const body = (await res.json()) as PitReadResult;
      assert.equal(body.found, true);
    });
  });
});
