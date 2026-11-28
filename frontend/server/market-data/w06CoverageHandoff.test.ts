/**
 * Snapshot-to-Live W-06 — targeted offline tests for the Coverage-to-W-06 identity handoff
 * adapter, hardened measurement boundary, and read-only observation runner/CLI.
 *
 * Strictly offline: uses synthetic/stubbed `fetch` handlers and temporary directories only.
 * No live network, no Dhan credentials, and no daemon process are touched.
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { luhnCheckDigit } from '../../../iips-platform/src/investment/contracts/ids';
import {
  DHAN_REVISION_COVERAGE_SCHEMA,
  measureDhanRevisionCoverage,
  type CapturedRevisionRef,
} from './dhanRevisionCoverage';
import { runW06Cli } from './runW06ObservationCli';
import {
  W06_MEASUREMENT_BOUNDARY,
  W06_OBSERVATION_SUMMARY_SCHEMA,
  parseCaptureDocumentToRevisionRef,
  projectCoverageReportToW06Rows,
  runW06CoverageObservation,
} from './w06CoverageHandoff';

const TARGET_PORTFOLIO_ID = 'DHAN_PORTFOLIO';
const PERSONAL_PORTFOLIO_ID = 'PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2';
const AS_OF = '2026-11-27';
const FIXED_NOW = new Date('2026-11-27T09:30:00.000Z');

const CAPTURE_REF: CapturedRevisionRef = {
  portfolioId: TARGET_PORTFOLIO_ID,
  revision: 3,
  provenanceDigest: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  capturedAt: '2026-11-27T09:00:00.000Z',
};

function padIndex(index1Based: number): string {
  return String(index1Based).padStart(4, '0');
}

function syntheticIsinForIndex(index1Based: number): string {
  const body = `INE${String(100000 + index1Based).padStart(6, '0')}A1`;
  let digits = '';
  for (const ch of body) {
    digits += ch >= '0' && ch <= '9' ? ch : String(ch.charCodeAt(0) - 55);
  }
  return `${body}${luhnCheckDigit(digits)}`;
}

function makeResolvedHoldingItem(params: {
  readonly observationId: string;
  readonly portfolioId?: string;
  readonly companyId: string;
  readonly symbol: string;
  readonly isin: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly series?: string;
  readonly active?: boolean;
  readonly portfolioRevision?: number;
}): Record<string, unknown> {
  const portfolioId = params.portfolioId ?? TARGET_PORTFOLIO_ID;
  const exchange = params.exchange ?? 'NSE';
  const series = params.series ?? 'EQ';
  const issuerId = `IN:EQISIN:${params.isin}`;
  const canonicalSecurityId = `IN:ISIN:${params.isin}`;
  const listingId = `IN:${exchange}:${params.symbol}:${series}:EQUITY`;
  const d114SecurityId = `ISIN:${params.isin}:${series}`;

  return {
    observationId: params.observationId,
    source: 'HOLDING',
    portfolioId,
    state: 'RESOLVED',
    reason: null,
    reasonText: null,
    detail: null,
    outcomeClass: 'RESOLVED',
    binding: {
      observationId: params.observationId,
      source: 'HOLDING',
      portfolioId,
      status: 'RESOLVED',
      issuerId,
      securityId: canonicalSecurityId,
      listingId,
      reason: null,
      detail: null,
      assessable: true,
    },
    resolution: {
      observationId: params.observationId,
      source: 'HOLDING',
      state: 'RESOLVED',
      reason: null,
      issuerId,
      securityId: canonicalSecurityId,
      listingId,
      candidates: [
        {
          issuerId,
          securityId: canonicalSecurityId,
          listingId,
          basis: 'ISIN+EXCHANGE+SYMBOL',
        },
      ],
      detail: null,
    },
    raw: {
      companyId: params.companyId,
      symbol: params.symbol,
      exchange,
      isin: params.isin,
      companyName: `${params.symbol} Ltd`,
      sector: null,
      portfolioRevision: params.portfolioRevision ?? CAPTURE_REF.revision,
      active: params.active ?? true,
      identityStatus: 'UNVERIFIED',
      resolutionDisposition: 'UNVERIFIED',
      'securityIdentity.securityId': d114SecurityId,
      'securityIdentity.isin': params.isin,
      'securityIdentity.series': series,
      'securityIdentity.isinAuthority': 'NON_AUTHORITATIVE',
    },
  };
}

function makeAgiCoverageItem(): Record<string, unknown> {
  return makeResolvedHoldingItem({
    observationId: 'holding:DHAN_PORTFOLIO:0001',
    companyId: 'EQ_AGI_IN',
    symbol: 'AGI',
    isin: 'INE415A01038',
    exchange: 'NSE',
    series: 'EQ',
  });
}

function makeAskAutoAmbiguousItem(): Record<string, unknown> {
  const observationId = 'holding:DHAN_PORTFOLIO:0006';
  const detail =
    'security IN:ISIN:INE491J01022 is listed in series EQ at 2026-11-27 across multiple exchanges (IN:BSE:544022:EQ:EQUITY, IN:NSE:ASKAUTOLTD:EQ:EQUITY); supply exchange or symbol to disambiguate';
  return {
    observationId,
    source: 'HOLDING',
    portfolioId: TARGET_PORTFOLIO_ID,
    state: 'AMBIGUOUS_LISTING',
    reason: 'MULTIPLE_SECURITIES_SHARE_LISTING',
    reasonText: 'Multiple registry entries share the observed exchange and symbol.',
    detail,
    outcomeClass: 'FAIL_CLOSED',
    binding: {
      observationId,
      source: 'HOLDING',
      portfolioId: TARGET_PORTFOLIO_ID,
      status: 'AMBIGUOUS_LISTING',
      issuerId: null,
      securityId: null,
      listingId: null,
      reason: 'MULTIPLE_SECURITIES_SHARE_LISTING',
      detail,
      assessable: false,
    },
    resolution: {
      observationId,
      source: 'HOLDING',
      state: 'AMBIGUOUS_LISTING',
      reason: 'MULTIPLE_SECURITIES_SHARE_LISTING',
      issuerId: null,
      securityId: null,
      listingId: null,
      candidates: [],
      detail,
    },
    raw: {
      companyId: 'EQ_ASKAUTOLTD_IN',
      symbol: 'ASKAUTOLTD',
      exchange: null,
      isin: 'INE491J01022',
      companyName: 'ASK Automotive Ltd',
      sector: null,
      portfolioRevision: CAPTURE_REF.revision,
      active: true,
      identityStatus: 'UNVERIFIED',
      resolutionDisposition: 'UNVERIFIED',
      'securityIdentity.securityId': 'ISIN:INE491J01022:B',
      'securityIdentity.isin': 'INE491J01022',
      'securityIdentity.series': 'B',
      'securityIdentity.isinAuthority': 'NON_AUTHORITATIVE',
    },
  };
}

function makeInactiveAiilPersonalItem(): Record<string, unknown> {
  const observationId = `holding:${PERSONAL_PORTFOLIO_ID}:0001`;
  const detail = 'no active listing matched symbol AIIL at 2026-11-27';
  return {
    observationId,
    source: 'HOLDING',
    portfolioId: PERSONAL_PORTFOLIO_ID,
    state: 'UNMATCHED',
    reason: 'SYMBOL_NOT_IN_REGISTRY',
    reasonText: 'Symbol is not present in the canonical listing registry.',
    detail,
    outcomeClass: 'FAIL_CLOSED',
    binding: {
      observationId,
      source: 'HOLDING',
      portfolioId: PERSONAL_PORTFOLIO_ID,
      status: 'UNMATCHED',
      issuerId: null,
      securityId: null,
      listingId: null,
      reason: 'SYMBOL_NOT_IN_REGISTRY',
      detail,
      assessable: false,
    },
    resolution: {
      observationId,
      source: 'HOLDING',
      state: 'UNMATCHED',
      reason: 'SYMBOL_NOT_IN_REGISTRY',
      issuerId: null,
      securityId: null,
      listingId: null,
      candidates: [],
      detail,
    },
    raw: {
      companyId: 'EQ_AIIL_IN',
      symbol: 'AIIL',
      exchange: null,
      isin: null,
      companyName: 'Authum Investment & Infrastructure Limited',
      sector: null,
      portfolioRevision: 1,
      active: false,
      identityStatus: null,
      resolutionDisposition: null,
      'securityIdentity.securityId': null,
      'securityIdentity.isin': null,
      'securityIdentity.series': null,
      'securityIdentity.isinAuthority': null,
    },
  };
}

function build66ItemCoverageReport(): Record<string, unknown> {
  const items: Record<string, unknown>[] = [];
  for (let i = 1; i <= 65; i += 1) {
    if (i === 1) {
      items.push(makeAgiCoverageItem());
    } else if (i === 6) {
      items.push(makeAskAutoAmbiguousItem());
    } else {
      const symbol = `SYM${padIndex(i)}`;
      items.push(
        makeResolvedHoldingItem({
          observationId: `holding:DHAN_PORTFOLIO:${padIndex(i)}`,
          companyId: `EQ_${symbol}_IN`,
          symbol,
          isin: syntheticIsinForIndex(i),
          exchange: 'NSE',
          series: 'EQ',
        }),
      );
    }
  }
  items.push(makeInactiveAiilPersonalItem());

  return {
    reportVersion: 1,
    asOf: AS_OF,
    generatedAt: '2026-11-27T09:29:59.000Z',
    registry: {
      schemaVersion: 1,
      issuers: 100,
      securities: 100,
      listings: 100,
    },
    totals: {
      total: 66,
      resolved: 64,
      unresolved: 2,
      assessable: 64,
      blocked: 2,
      byState: {
        RESOLVED: 64,
        UNMATCHED: 1,
        AMBIGUOUS_ISSUER: 0,
        AMBIGUOUS_SECURITY: 0,
        AMBIGUOUS_LISTING: 1,
        CONFLICTING_IDENTIFIERS: 0,
        INACTIVE_OR_SUPERSEDED: 0,
        INSUFFICIENT_IDENTIFIER_QUALITY: 0,
      },
      byReason: {},
      bySource: {
        HOLDING: { total: 66, resolved: 64, unresolved: 2 },
      },
    },
    items,
  };
}

interface RecordedHttpRequest {
  readonly method: string;
  readonly url: string;
  readonly body: unknown;
}

function makeStubServerFetch(coverageReport: Record<string, unknown>): {
  readonly fetchImpl: typeof fetch;
  readonly requests: RecordedHttpRequest[];
} {
  const requests: RecordedHttpRequest[] = [];

  const fetchImpl: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method ?? 'GET').toUpperCase();
    const rawBody = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : null;
    requests.push({ method, url, body: rawBody });

    const parsedUrl = new URL(url);
    if (method === 'GET' && parsedUrl.pathname === '/api/investment/coverage') {
      return new Response(JSON.stringify(coverageReport), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'GET' && parsedUrl.pathname === `/api/user-portfolios/${TARGET_PORTFOLIO_ID}`) {
      return new Response(
        JSON.stringify({
          portfolio: {
            portfolioId: TARGET_PORTFOLIO_ID,
            revision: CAPTURE_REF.revision,
            provenanceDigest: CAPTURE_REF.provenanceDigest,
            totalHoldingsCount: 65,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (method === 'POST' && parsedUrl.pathname === '/api/dhan/quotes') {
      const payload = rawBody as { companyId: string; exchangeSegment: string; securityId: string };
      return new Response(
        JSON.stringify({
          data: {
            freshness: 'SNAPSHOT',
            qualityState: 'GOOD',
            asOf: '2026-11-27T09:29:45.000Z',
            receivedAt: '2026-11-27T09:29:46.000Z',
            evaluatedAt: '2026-11-27T09:29:47.000Z',
            quote: {
              companyId: payload.companyId,
              symbol: payload.companyId.replace(/^EQ_|_IN$/g, ''),
              exchange: payload.exchangeSegment === 'BSE_EQ' ? 'BSE' : 'NSE',
              currency: 'INR',
              ltp: 850.25,
              open: 840,
              high: 855,
              low: 838,
              previousClose: 842,
              volume: 12000,
              change: 8.25,
              pctChange: 0.98,
              bid: 850.1,
              ask: 850.4,
            },
            securityId: payload.securityId,
            provenance: {
              sourceClassification: 'SYNTHETIC',
              dataVersion: 'synthetic/v1',
              lineageHash: null,
              vendorTier: null,
            },
            providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
            freshnessStatus: null,
            freshnessStatusFailure: null,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (method === 'GET' && parsedUrl.pathname === '/api/dhan/freshness') {
      return new Response(
        JSON.stringify({
          data: {
            domain: 'D01_QUOTES',
            cacheState: 'CURRENT',
            asOf: '2026-11-27T09:29:45.000Z',
            timestampEvidence: 'VALID',
            receivedAt: '2026-11-27T09:29:46.000Z',
            evaluatedAt: '2026-11-27T09:29:47.000Z',
            observationEvaluatedAt: null,
            thresholdSeconds: 300,
            ageSeconds: 15,
            verdict: 'GOOD',
            staleConcessionActive: false,
            suppressExecution: false,
            eligibleForUse: true,
            lastRefresh: { outcome: 'OK', lastFailure: null },
            irrFreshness: 'SNAPSHOT',
            irrQualityState: 'GOOD',
            providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: parsedUrl.pathname } }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return { fetchImpl, requests };
}

describe('W-06 Coverage-to-W-06 identity handoff and observation runner', () => {
  it('1. propagates AGI Greenpac canonical Dhan 3-tuple verbatim and issues 1 quote POST + 1 freshness GET (plus BSE derivation)', async () => {
    const agiNse = makeAgiCoverageItem();
    const agiBse = makeResolvedHoldingItem({
      observationId: 'holding:DHAN_PORTFOLIO:0002',
      companyId: 'EQ_AGI_BSE_IN',
      symbol: '500187',
      isin: 'INE415A01038',
      exchange: 'BSE',
      series: 'EQ',
    });

    const report = { reportVersion: 1, items: [agiNse, agiBse] };
    const projected = projectCoverageReportToW06Rows(report, TARGET_PORTFOLIO_ID);
    expect(projected.ok).toBe(true);
    if (!projected.ok) return;

    expect(projected.rows).toHaveLength(2);
    expect(projected.rows[0]).toMatchObject({
      rowId: 'holding:DHAN_PORTFOLIO:0001',
      companyId: 'EQ_AGI_IN',
      exchangeSegment: 'NSE_EQ',
      securityId: 'ISIN:INE415A01038:EQ',
      identityResolved: true,
    });
    expect(projected.rows[1]).toMatchObject({
      rowId: 'holding:DHAN_PORTFOLIO:0002',
      companyId: 'EQ_AGI_BSE_IN',
      exchangeSegment: 'BSE_EQ',
      securityId: 'ISIN:INE415A01038:EQ',
      identityResolved: true,
    });

    // Run single-item AGI observation and verify exact 1 quote + 1 freshness wire payload.
    const { fetchImpl, requests } = makeStubServerFetch({ reportVersion: 1, items: [agiNse] });
    const outcome = await runW06CoverageObservation({
      apiBaseUrl: 'http://127.0.0.1:8787',
      portfolioId: TARGET_PORTFOLIO_ID,
      asOf: AS_OF,
      capture: CAPTURE_REF,
      fetchImpl,
      now: () => FIXED_NOW,
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    const quoteReqs = requests.filter((r) => r.method === 'POST' && r.url.endsWith('/api/dhan/quotes'));
    const freshReqs = requests.filter((r) => r.method === 'GET' && r.url.includes('/api/dhan/freshness?'));
    expect(quoteReqs).toHaveLength(1);
    expect(freshReqs).toHaveLength(1);
    expect(quoteReqs[0]?.body).toEqual({
      companyId: 'EQ_AGI_IN',
      exchangeSegment: 'NSE_EQ',
      securityId: 'ISIN:INE415A01038:EQ',
    });
    const freshParams = new URL(freshReqs[0]!.url).searchParams;
    expect({
      domain: freshParams.get('domain'),
      companyId: freshParams.get('companyId'),
      exchangeSegment: freshParams.get('exchangeSegment'),
      securityId: freshParams.get('securityId'),
    }).toEqual({
      domain: 'D01_QUOTES',
      companyId: 'EQ_AGI_IN',
      exchangeSegment: 'NSE_EQ',
      securityId: 'ISIN:INE415A01038:EQ',
    });
    expect(outcome.report.identities[0]?.category).toBe('COVERAGE_CURRENT');
    expect(outcome.summary.totalDataCalls).toBe(2);
  });

  it('2. reads only the literal flat dotted key raw["securityIdentity.securityId"] and rejects nested or malformed shapes', async () => {
    const flatItem = makeAgiCoverageItem();

    // Mutate a clone to replace the flat dotted key with a nested `raw.securityIdentity` object.
    const nestedOnlyItem = structuredClone(flatItem) as {
      observationId: string;
      binding: Record<string, unknown>;
      resolution: Record<string, unknown>;
      raw: Record<string, unknown>;
    };
    nestedOnlyItem.observationId = 'holding:DHAN_PORTFOLIO:0002';
    nestedOnlyItem.binding.observationId = 'holding:DHAN_PORTFOLIO:0002';
    nestedOnlyItem.resolution.observationId = 'holding:DHAN_PORTFOLIO:0002';
    delete nestedOnlyItem.raw['securityIdentity.securityId'];
    nestedOnlyItem.raw.securityIdentity = {
      securityId: 'ISIN:INE415A01038:EQ',
      isin: 'INE415A01038',
      series: 'EQ',
      isinAuthority: 'NON_AUTHORITATIVE',
    };

    // Mutate a clone to flag `securityIdentityMalformed: true`.
    const malformedFlagItem = structuredClone(flatItem) as {
      observationId: string;
      binding: Record<string, unknown>;
      resolution: Record<string, unknown>;
      raw: Record<string, unknown>;
    };
    malformedFlagItem.observationId = 'holding:DHAN_PORTFOLIO:0003';
    malformedFlagItem.binding.observationId = 'holding:DHAN_PORTFOLIO:0003';
    malformedFlagItem.resolution.observationId = 'holding:DHAN_PORTFOLIO:0003';
    malformedFlagItem.raw.securityIdentityMalformed = true;

    const projected = projectCoverageReportToW06Rows(
      { reportVersion: 1, items: [flatItem, nestedOnlyItem, malformedFlagItem] },
      TARGET_PORTFOLIO_ID,
    );
    expect(projected.ok).toBe(true);
    if (!projected.ok) return;

    expect(projected.rows[0]?.identityResolved).toBe(true);
    expect(projected.rows[0]?.securityId).toBe('ISIN:INE415A01038:EQ');

    expect(projected.rows[1]?.identityResolved).toBe(false);
    expect(projected.rows[1]?.securityId).toBeNull();
    expect(projected.rows[1]?.diagnostics?.storedSecurityId).toBeNull();

    expect(projected.rows[2]?.identityResolved).toBe(false);
    expect(projected.rows[2]?.securityId).toBeNull();

    // Verify only the flat-keyed row triggers calls when passed into measureDhanRevisionCoverage.
    let calls = 0;
    const measured = await measureDhanRevisionCoverage(CAPTURE_REF, projected.rows, {
      now: () => FIXED_NOW,
      readQuote: async () => {
        calls += 1;
        return { ok: false, code: 'TRANSPORT_FAILURE', message: 'stub', identityFailure: false };
      },
      readFreshness: async () => {
        calls += 1;
        return { ok: false, code: 'TRANSPORT_FAILURE', message: 'stub' };
      },
    });
    expect(measured.ok).toBe(true);
    expect(calls).toBe(2); // 1 quote + 1 freshness for flatItem; 0 for nestedOnlyItem and malformedFlagItem
  });

  it('3. keeps ASKAUTOLTD (AMBIGUOUS_LISTING with stored ISIN:INE491J01022:B) unresolved with 0 quote/freshness calls', async () => {
    const askItem = makeAskAutoAmbiguousItem();
    const { fetchImpl, requests } = makeStubServerFetch({ reportVersion: 1, items: [askItem] });

    const outcome = await runW06CoverageObservation({
      apiBaseUrl: 'http://127.0.0.1:8787',
      portfolioId: TARGET_PORTFOLIO_ID,
      asOf: AS_OF,
      capture: CAPTURE_REF,
      fetchImpl,
      now: () => FIXED_NOW,
    });

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;

    // Only the single GET /api/investment/coverage read was issued — zero quote or freshness calls.
    expect(requests).toHaveLength(1);
    expect(requests[0]?.method).toBe('GET');
    expect(new URL(requests[0]!.url).pathname).toBe('/api/investment/coverage');

    expect(outcome.report.totals.rows).toBe(1);
    expect(outcome.report.totals.identityResolved).toBe(0);
    expect(outcome.report.totals.identityUnresolved).toBe(1);
    expect(outcome.summary.quoteCalls).toBe(0);
    expect(outcome.summary.freshnessCalls).toBe(0);
    expect(outcome.summary.totalDataCalls).toBe(0);

    const row = outcome.summary.rows[0]!;
    expect(row).toEqual({
      rowId: 'holding:DHAN_PORTFOLIO:0006',
      companyId: 'EQ_ASKAUTOLTD_IN',
      exchangeSegment: null,
      storedSecurityId: 'ISIN:INE491J01022:B',
      securityId: null,
      identityState: 'AMBIGUOUS_LISTING',
      identityReason: 'MULTIPLE_SECURITIES_SHARE_LISTING',
      calls: [],
      category: 'IDENTITY_UNRESOLVED',
    });
  });

  it('4. excludes out-of-scope inactive AIIL into excludedItems and blocks inactive in-portfolio rows from calls', async () => {
    const aiilPersonal = makeInactiveAiilPersonalItem();
    const inactiveInScope = makeResolvedHoldingItem({
      observationId: 'holding:DHAN_PORTFOLIO:0099',
      companyId: 'EQ_INACTIVE_IN',
      symbol: 'INACT',
      isin: 'INE999999A10',
      active: false,
    });
    const watchlistItem = {
      ...makeAgiCoverageItem(),
      observationId: 'watchlist:DEFAULT:0001',
      source: 'WATCHLIST',
      portfolioId: null,
    };

    const projected = projectCoverageReportToW06Rows(
      { reportVersion: 1, items: [aiilPersonal, watchlistItem, inactiveInScope] },
      TARGET_PORTFOLIO_ID,
    );
    expect(projected.ok).toBe(true);
    if (!projected.ok) return;

    expect(projected.excludedItems).toEqual([
      {
        observationId: `holding:${PERSONAL_PORTFOLIO_ID}:0001`,
        source: 'HOLDING',
        portfolioId: PERSONAL_PORTFOLIO_ID,
        symbol: 'AIIL',
        active: false,
        state: 'UNMATCHED',
        exclusionReason: 'OUT_OF_SCOPE_PORTFOLIO',
      },
      {
        observationId: 'watchlist:DEFAULT:0001',
        source: 'WATCHLIST',
        portfolioId: null,
        symbol: 'AGI',
        active: true,
        state: 'RESOLVED',
        exclusionReason: 'NON_HOLDING_SOURCE',
      },
    ]);

    expect(projected.rows).toHaveLength(1);
    expect(projected.rows[0]?.rowId).toBe('holding:DHAN_PORTFOLIO:0099');
    expect(projected.rows[0]?.identityResolved).toBe(false);
    expect(projected.rows[0]?.securityId).toBeNull();
  });

  it('5. reconciles the 66-item host fixture end-to-end: 64 resolved, 1 unresolved, 1 excluded, 128 total data calls, BOM-free artifacts', async () => {
    const coverage66 = build66ItemCoverageReport();
    const { fetchImpl, requests } = makeStubServerFetch(coverage66);
    const tempDir = mkdtempSync(join(tmpdir(), 'w06-handoff-test-'));

    try {
      const exactCapturePath = join(tempDir, 'exact-owner-bound-portfolio-capture.json');
      writeFileSync(
        exactCapturePath,
        JSON.stringify({
          schema: 'iips.w11-dep1.owner-bound-portfolio-capture.exact/v1',
          irrMirror: {
            firstView: {
              portfolioId: TARGET_PORTFOLIO_ID,
              revision: CAPTURE_REF.revision,
              provenanceDigest: CAPTURE_REF.provenanceDigest,
              holdings: Array.from({ length: 65 }, (_, idx) => ({ row: idx + 1 })),
            },
          },
          consumerObservation: {
            finalReadCompletedAtUtc: CAPTURE_REF.capturedAt,
          },
        }),
        'utf8',
      );

      const outDir = join(tempDir, 'out');
      const stdoutLines: string[] = [];
      const stderrLines: string[] = [];

      const cliRes = await runW06Cli(
        [
          '--api-base-url',
          'http://127.0.0.1:8787',
          '--portfolio-id',
          TARGET_PORTFOLIO_ID,
          '--as-of',
          AS_OF,
          '--capture-file',
          exactCapturePath,
          '--out-dir',
          outDir,
        ],
        {
          fetchImpl,
          now: () => FIXED_NOW,
          stdout: (line) => stdoutLines.push(line),
          stderr: (line) => stderrLines.push(line),
        },
      );

      expect(stderrLines).toEqual([]);
      expect(cliRes.exitCode).toBe(0);
      expect(cliRes.outcome?.ok).toBe(true);
      if (!cliRes.outcome || !cliRes.outcome.ok) return;

      // Exact HTTP call boundary: 1 coverage GET + 64 quote POSTs + 64 freshness GETs = 129 HTTP calls.
      const coverageCalls = requests.filter((r) => new URL(r.url).pathname === '/api/investment/coverage');
      const quoteCalls = requests.filter((r) => new URL(r.url).pathname === '/api/dhan/quotes');
      const freshnessCalls = requests.filter((r) => new URL(r.url).pathname === '/api/dhan/freshness');
      expect(coverageCalls).toHaveLength(1);
      expect(quoteCalls).toHaveLength(64);
      expect(freshnessCalls).toHaveLength(64);
      expect(requests).toHaveLength(129);

      // Verify ASKAUTOLTD and AIIL were never passed to quote or freshness endpoints.
      expect(quoteCalls.some((q) => JSON.stringify(q.body).includes('ASKAUTOLTD'))).toBe(false);
      expect(quoteCalls.some((q) => JSON.stringify(q.body).includes('INE491J01022'))).toBe(false);
      expect(quoteCalls.some((q) => JSON.stringify(q.body).includes('AIIL'))).toBe(false);

      // Verify written JSON artifacts are UTF-8 without BOM and match exact schema/totals.
      const reportPath = join(outDir, 'w06-revision-coverage-report.json');
      const summaryPath = join(outDir, 'w06-observation-summary.json');
      const retainedCovPath = join(outDir, 'identities-route-response.json');

      for (const filePath of [reportPath, summaryPath, retainedCovPath]) {
        const bytes = readFileSync(filePath);
        expect(bytes[0]).not.toBe(0xef); // no UTF-8 BOM
      }

      const writtenReport = JSON.parse(readFileSync(reportPath, 'utf8'));
      const writtenSummary = JSON.parse(readFileSync(summaryPath, 'utf8'));

      expect(writtenReport.schema).toBe(DHAN_REVISION_COVERAGE_SCHEMA);
      expect(writtenReport.totals).toEqual({
        rows: 65,
        identityResolved: 64,
        identityUnresolved: 1,
        quotePresent: 64,
        quoteAbsent: 1,
        coverageCurrent: 64,
        coverageStale: 0,
        coverageUnavailable: 0,
        coverageUnknown: 0,
        statusUnreadable: 0,
      });

      expect(writtenSummary.schema).toBe(W06_OBSERVATION_SUMMARY_SCHEMA);
      expect(writtenSummary.boundary).toBe(W06_MEASUREMENT_BOUNDARY);
      expect(writtenSummary.observedCoverageItems).toBe(66);
      expect(writtenSummary.excludedItems).toHaveLength(1);
      expect(writtenSummary.excludedItems[0]?.observationId).toBe(
        `holding:${PERSONAL_PORTFOLIO_ID}:0001`,
      );
      expect(writtenSummary.quoteCalls).toBe(64);
      expect(writtenSummary.freshnessCalls).toBe(64);
      expect(writtenSummary.totalDataCalls).toBe(128);

      const agiSummaryRow = writtenSummary.rows.find(
        (r: { rowId: string }) => r.rowId === 'holding:DHAN_PORTFOLIO:0001',
      );
      expect(agiSummaryRow?.companyId).toBe('EQ_AGI_IN');
      expect(agiSummaryRow?.exchangeSegment).toBe('NSE_EQ');
      expect(agiSummaryRow?.securityId).toBe('ISIN:INE415A01038:EQ');
      expect(agiSummaryRow?.calls).toHaveLength(2);

      const askSummaryRow = writtenSummary.rows.find(
        (r: { rowId: string }) => r.rowId === 'holding:DHAN_PORTFOLIO:0006',
      );
      expect(askSummaryRow?.category).toBe('IDENTITY_UNRESOLVED');
      expect(askSummaryRow?.storedSecurityId).toBe('ISIN:INE491J01022:B');
      expect(askSummaryRow?.securityId).toBeNull();
      expect(askSummaryRow?.calls).toEqual([]);
      expect(stdoutLines.join('\n')).toContain('dataCalls=128 (quotes=64, freshness=64)');
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('6. fails closed on missing companyId, missing/non-equity listingId (no NSE_EQ default), non-loopback URL, sanitized summary capture, and revision drift', async () => {
    // (a) Missing raw.companyId on an otherwise resolved item -> ineligible, 0 calls.
    const missingCompanyItem = structuredClone(makeAgiCoverageItem()) as {
      observationId: string;
      binding: Record<string, unknown>;
      resolution: Record<string, unknown>;
      raw: Record<string, unknown>;
    };
    missingCompanyItem.raw.companyId = '';

    // (b) Missing binding.listingId on an item claiming RESOLVED -> exchangeSegment remains null (never NSE_EQ).
    const missingListingItem = structuredClone(makeAgiCoverageItem()) as {
      observationId: string;
      binding: Record<string, unknown>;
      resolution: Record<string, unknown>;
      raw: Record<string, unknown>;
    };
    missingListingItem.observationId = 'holding:DHAN_PORTFOLIO:0002';
    missingListingItem.binding.observationId = 'holding:DHAN_PORTFOLIO:0002';
    missingListingItem.resolution.observationId = 'holding:DHAN_PORTFOLIO:0002';
    missingListingItem.binding.listingId = null;
    missingListingItem.resolution.listingId = null;

    const projected = projectCoverageReportToW06Rows(
      { reportVersion: 1, items: [missingCompanyItem, missingListingItem] },
      TARGET_PORTFOLIO_ID,
    );
    expect(projected.ok).toBe(true);
    if (!projected.ok) return;
    expect(projected.rows).toHaveLength(2);
    expect(projected.rows.every((r) => r.identityResolved === false)).toBe(true);
    expect(projected.rows.every((r) => r.exchangeSegment === null)).toBe(true);
    expect(projected.rows.every((r) => r.securityId === null)).toBe(true);

    // (c) Non-loopback URL rejected before any HTTP call is made.
    let externalFetchCalled = false;
    const nonLoopback = await runW06CoverageObservation({
      apiBaseUrl: 'https://example.com:8787',
      portfolioId: TARGET_PORTFOLIO_ID,
      asOf: AS_OF,
      capture: CAPTURE_REF,
      fetchImpl: async () => {
        externalFetchCalled = true;
        throw new Error('must not be called');
      },
    });
    expect(nonLoopback.ok).toBe(false);
    if (!nonLoopback.ok) expect(nonLoopback.code).toBe('NON_LOOPBACK_API_BASE_URL');
    expect(externalFetchCalled).toBe(false);

    // (d) Sanitized W11-DEP1 summary capture is rejected fail-closed.
    const sanitizedCheck = parseCaptureDocumentToRevisionRef(
      { schema: 'iips.w11-dep1.owner-bound-portfolio-capture.summary/v1', revision: 3 },
      TARGET_PORTFOLIO_ID,
    );
    expect(sanitizedCheck.ok).toBe(false);

    // (e) Revision drift between capture.revision and raw.portfolioRevision aborts before any quote/freshness calls.
    const driftedAgi = makeResolvedHoldingItem({
      observationId: 'holding:DHAN_PORTFOLIO:0001',
      companyId: 'EQ_AGI_IN',
      symbol: 'AGI',
      isin: 'INE415A01038',
      portfolioRevision: CAPTURE_REF.revision + 1,
    });
    const { fetchImpl, requests } = makeStubServerFetch({ reportVersion: 1, items: [driftedAgi] });
    const driftOutcome = await runW06CoverageObservation({
      apiBaseUrl: 'http://127.0.0.1:8787',
      portfolioId: TARGET_PORTFOLIO_ID,
      asOf: AS_OF,
      capture: CAPTURE_REF,
      fetchImpl,
      now: () => FIXED_NOW,
    });
    expect(driftOutcome.ok).toBe(false);
    if (!driftOutcome.ok) expect(driftOutcome.code).toBe('REVISION_DRIFT');
    expect(requests).toHaveLength(1); // only GET /api/investment/coverage; 0 quote or freshness calls
  });
});
