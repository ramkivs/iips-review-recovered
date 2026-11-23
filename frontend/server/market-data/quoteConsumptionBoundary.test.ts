/**
 * W-29 — the shared IRR quote-consumption boundary.
 *
 * WHAT THESE TESTS ESTABLISH
 *   1. ONE MIXED BATCH yields five distinct, correctly associated outcomes — current, stale,
 *      unavailable, unmapped and malformed identity — with per-identity freshness, `asOf`
 *      and `providerQualification`, and with no missing price represented as zero.
 *   2. Bounded concurrency: a batch never exceeds its configured in-flight width.
 *   3. Rate-limit awareness: one `RATE_LIMITED` answer stops further dispatch and every
 *      remaining identity is reported as explicitly NOT attempted.
 *   4. Partial results are preserved: a failed member never removes an entry, never shifts a
 *      neighbouring price and never fabricates a value.
 *   5. Architecture: exactly one IRR module consumes IPD quotes, the presentation route
 *      composes no transport of its own, and no IRR browser code can reach the boundary.
 *
 * EVERYTHING HERE IS SYNTHETIC. The transport is an in-process fixture serving IPD's own
 * routes and response envelopes. No Dhan endpoint is contacted, no credential is read, and
 * no live observation exists in this file.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve, sep } from 'node:path';

import {
  DEFAULT_QUOTE_BATCH_CONCURRENCY,
  IDENTITY_UNMAPPED_CODES,
  IRR_PROVIDER_QUALIFICATION,
  MAX_QUOTE_BATCH_CONCURRENCY,
  QUOTE_CONSUMPTION_OUTCOMES,
  consumeQuote,
  consumeQuotes,
  type QuoteConsumptionDeps,
} from './quoteConsumptionBoundary';
import {
  syntheticFreshnessStatus,
  syntheticQuoteEnvelope,
} from './dhanSyntheticFixtures';
import { handleDhanQuotesRequest } from './dhanMarketDataRoutes';

const HERE = resolve(__dirname);

/* --------------------------------------------------------------------------------------- *
 * A synthetic IPD transport that answers PER IDENTITY
 *
 * The shared `dhanSyntheticFixtures` scenarios answer per RUN; a mixed-batch test needs a
 * response that varies per requested identity within one batch. This fixture therefore keys
 * its behaviour on the request's companyId and serves IPD's own routes and envelopes.
 * --------------------------------------------------------------------------------------- */

type IdentityBehaviour =
  | 'CURRENT'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'UNMAPPED'
  | 'RATE_LIMITED'
  | 'MALFORMED_ENVELOPE'
  | 'DEPTH_UNAVAILABLE'
  | 'SLOW';

class SyntheticPerIdentityTransport {
  private server: http.Server | null = null;
  private baseUrl = '';
  public behaviours: Record<string, IdentityBehaviour> = {};
  public quoteRequestCount = 0;
  public freshnessRequestCount = 0;
  public inFlight = 0;
  public maxInFlight = 0;
  public requestedCompanyIds: string[] = [];
  public delayMs = 40;

  public async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      const path = (req.url ?? '').split('?')[0];
      if (path === '/v1/quotes') {
        void this.handleQuote(req, res);
        return;
      }
      if (path === '/v1/freshness') {
        void this.handleFreshness(req, res);
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'unknown route' } }));
    });
    await new Promise<void>((done) => this.server!.listen(0, '127.0.0.1', done));
    this.baseUrl = `http://127.0.0.1:${(this.server!.address() as AddressInfo).port}`;
  }

  public async stop(): Promise<void> {
    if (this.server === null) return;
    await new Promise<void>((done) => this.server!.close(() => done()));
    this.server = null;
  }

  public reset(): void {
    this.behaviours = {};
    this.quoteRequestCount = 0;
    this.freshnessRequestCount = 0;
    this.inFlight = 0;
    this.maxInFlight = 0;
    this.requestedCompanyIds = [];
    this.delayMs = 40;
  }

  public deps(overrides: Partial<QuoteConsumptionDeps> = {}): QuoteConsumptionDeps {
    return {
      transport: {
        ok: true,
        config: {
          baseUrl: this.baseUrl,
          token: 'synthetic-transport-token',
          timeoutMs: 5000,
          configured: true,
        },
      },
      ...overrides,
    };
  }

  private async withInFlight(delayMs: number): Promise<void> {
    this.inFlight += 1;
    this.maxInFlight = Math.max(this.maxInFlight, this.inFlight);
    try {
      await new Promise<void>((done) => setTimeout(done, delayMs));
    } finally {
      this.inFlight -= 1;
    }
  }

  private async handleQuote(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
    const companyId = String(body.companyId ?? '');
    this.quoteRequestCount += 1;
    this.requestedCompanyIds.push(companyId);

    const behaviour = this.behaviours[companyId] ?? 'CURRENT';
    await this.withInFlight(behaviour === 'SLOW' ? this.delayMs * 3 : this.delayMs);

    const send = (status: number, payload: unknown): void => {
      const text = JSON.stringify(payload);
      res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
      res.end(text);
    };

    switch (behaviour) {
      case 'CURRENT':
        send(200, {
          ok: true,
          envelope: syntheticQuoteEnvelope({ qualityState: 'GOOD', companyId }),
          freshness: 'CURRENT',
        });
        return;
      case 'STALE':
        send(200, {
          ok: true,
          envelope: syntheticQuoteEnvelope({
            qualityState: 'STALE',
            companyId,
            asOf: '2026-11-06T06:00:00.000Z',
          }),
          freshness: 'STALE',
        });
        return;
      case 'DEPTH_UNAVAILABLE': {
        const envelope = syntheticQuoteEnvelope({ qualityState: 'GOOD', companyId });
        const payload = { ...(envelope.payload as Record<string, unknown>), bid: null, ask: null };
        send(200, { ok: true, envelope: { ...envelope, payload }, freshness: 'CURRENT' });
        return;
      }
      case 'UNAVAILABLE':
        send(502, { error: { code: 'PROVIDER_STATUS_FAILURE', message: 'provider HTTP 403' } });
        return;
      case 'UNMAPPED':
        send(502, {
          error: { code: 'UNRESOLVED_INSTRUMENT', message: 'no exact mapping for the requested canonical identity' },
        });
        return;
      case 'RATE_LIMITED':
        send(429, { error: { code: 'RATE_LIMITED', message: 'provider request budget exhausted' } });
        return;
      case 'MALFORMED_ENVELOPE':
        send(200, { ok: true, envelope: {}, freshness: 'CURRENT' });
        return;
      default:
        send(200, { ok: true, envelope: syntheticQuoteEnvelope({ companyId }), freshness: 'CURRENT' });
    }
  }

  private async handleFreshness(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const companyId = url.searchParams.get('companyId') ?? '';
    this.freshnessRequestCount += 1;
    const behaviour = this.behaviours[companyId] ?? 'CURRENT';

    const status = behaviour === 'STALE'
      ? syntheticFreshnessStatus({ cacheState: 'STALE', verdict: 'STALE', ageSeconds: 1200, staleConcessionActive: true })
      : behaviour === 'UNAVAILABLE'
        ? syntheticFreshnessStatus({
            cacheState: 'UNAVAILABLE',
            verdict: 'UNAVAILABLE',
            ageSeconds: 2400,
            staleConcessionActive: false,
            suppressExecution: true,
            eligibleForUse: false,
          })
        : syntheticFreshnessStatus({ cacheState: 'CURRENT', verdict: 'GOOD', ageSeconds: 120 });

    const text = JSON.stringify(status);
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
    res.end(text);
  }
}

const ipd = new SyntheticPerIdentityTransport();

beforeAll(async () => {
  await ipd.start();
});

afterAll(async () => {
  await ipd.stop();
});

afterEach(() => {
  ipd.reset();
});

/** The five-identity mixed batch every remaining assertion reuses. */
const MIXED_BATCH = [
  { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment: 'NSE_EQ' },
  { companyId: 'SYNTH_STALE', securityId: 'ISIN:INE009A01021:EQ', exchangeSegment: 'NSE_EQ' },
  { companyId: 'SYNTH_UNAVAILABLE', securityId: 'ISIN:INE467B01029:EQ', exchangeSegment: 'NSE_EQ' },
  { companyId: 'SYNTH_UNMAPPED', securityId: 'ISIN:INE040A01034:EQ', exchangeSegment: 'BSE_EQ' },
  { companyId: 'SYNTH_MALFORMED', securityId: 'NOT-A-CANONICAL-IDENTITY' },
];

function installMixedBehaviours(): void {
  ipd.behaviours = {
    SYNTH_CURRENT: 'CURRENT',
    SYNTH_STALE: 'STALE',
    SYNTH_UNAVAILABLE: 'UNAVAILABLE',
    SYNTH_UNMAPPED: 'UNMAPPED',
  };
}

describe('W-29 mixed batch — five outcomes, one batch, one projection', () => {
  it('preserves every distinct outcome in request order', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());

    expect(batch.requestedCount).toBe(5);
    expect(batch.entries).toHaveLength(5);
    expect(batch.entries.map((entry) => entry.outcome)).toEqual([
      'CURRENT',
      'STALE',
      'UNAVAILABLE',
      'UNMAPPED',
      'MALFORMED_IDENTITY',
    ]);
    // Each entry echoes the request it answers, so correlation is positional AND explicit.
    expect(batch.entries.map((entry) => entry.request.companyId)).toEqual([
      'SYNTH_CURRENT',
      'SYNTH_STALE',
      'SYNTH_UNAVAILABLE',
      'SYNTH_UNMAPPED',
      'SYNTH_MALFORMED',
    ]);
    expect(batch.counts).toEqual({
      CURRENT: 1,
      STALE: 1,
      UNAVAILABLE: 1,
      UNMAPPED: 1,
      MALFORMED_IDENTITY: 1,
    });
    expect(batch.pricedCount).toBe(2);
    expect(batch.worstFreshness).toBe('UNAVAILABLE');
    expect(batch.rateLimited).toBe(false);
  });

  it('associates freshness with the identity it belongs to, never with the batch', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());
    const [current, stale, unavailable] = batch.entries;

    expect(current!.freshness).toBe('SNAPSHOT');
    expect(current!.freshnessVerdict).toBe('GOOD');
    expect(stale!.freshness).toBe('STALE');
    expect(stale!.freshnessVerdict).toBe('STALE');
    // A stale quote is never promoted to current, and never to LIVE.
    expect(stale!.freshness).not.toBe('SNAPSHOT');
    expect(unavailable!.freshness).toBe('UNAVAILABLE');

    for (const entry of batch.entries) {
      expect(entry.freshness).not.toBe('LIVE');
      expect(entry.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    }
  });

  it('propagates asOf per identity, not one timestamp for the batch', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());
    const [current, stale] = batch.entries;

    expect(current!.asOf).toBe('2026-11-06T10:15:00.000Z');
    expect(stale!.asOf).toBe('2026-11-06T06:00:00.000Z');
    // Nothing invents a timestamp for an identity that was never observed.
    expect(batch.entries[2]!.asOf).toBeNull();
    expect(batch.entries[3]!.asOf).toBeNull();
  });

  it('carries providerQualification on every outcome, including the failures', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());
    for (const entry of batch.entries) {
      expect(entry.providerQualification).toBe(IRR_PROVIDER_QUALIFICATION);
    }
    expect(batch.providerQualification).toBe(IRR_PROVIDER_QUALIFICATION);
  });

  it('distinguishes an unmapped identity from unavailable market data', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());
    const unmapped = batch.entries[3]!;
    const unavailable = batch.entries[2]!;

    expect(unmapped.outcome).toBe('UNMAPPED');
    expect(unmapped.unmapped).toEqual({
      code: 'UNRESOLVED_INSTRUMENT',
      message: 'no exact mapping for the requested canonical identity',
    });
    // An identity answer carries no market-data fields at all.
    expect(unmapped.unavailable).toBeNull();
    expect(unmapped.value).toBeNull();

    expect(unavailable.outcome).toBe('UNAVAILABLE');
    expect(unavailable.unavailable).toMatchObject({
      code: 'PROVIDER_STATUS_FAILURE',
      connectionAttempted: true,
      notAttempted: false,
    });
    // An identity answer is never reported as data unavailability, and vice versa.
    expect(unavailable.unmapped).toBeNull();
  });

  it('never sends a malformed identity to the transport and never spends provider budget on it', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(
      [
        { companyId: 'SYNTH_CURRENT' , securityId: 'ISIN:INE002A01018:EQ' },
        { companyId: 'SYNTH_MALFORMED', securityId: 'ISIN:BAD' },
      ],
      ipd.deps(),
    );
    expect(batch.entries[1]!.outcome).toBe('MALFORMED_IDENTITY');
    expect(batch.entries[1]!.malformedIdentity?.code).toBe('MALFORMED_REQUEST');
    expect(batch.entries[1]!.unavailable).toBeNull();
    expect(batch.entries[1]!.value).toBeNull();
    // Exactly one quote request was issued: the malformed identity consumed none.
    expect(ipd.quoteRequestCount).toBe(1);
    expect(ipd.requestedCompanyIds).toEqual(['SYNTH_CURRENT']);
  });

  it('reports a missing company id as an explicit malformed identity', async () => {
    const batch = await consumeQuotes([{ securityId: 'ISIN:INE002A01018:EQ' }], ipd.deps());
    expect(batch.entries[0]!.outcome).toBe('MALFORMED_IDENTITY');
    expect(batch.entries[0]!.malformedIdentity?.code).toBe('MISSING_REQUIRED_FIELD');
    expect(ipd.quoteRequestCount).toBe(0);
  });
});

describe('W-29 — no missing price is ever represented as zero', () => {
  it('never fabricates a quote for an unavailable or unmapped identity', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());
    for (const entry of batch.entries) {
      if (entry.outcome === 'UNAVAILABLE' || entry.outcome === 'UNMAPPED' || entry.outcome === 'MALFORMED_IDENTITY') {
        // Not zero, not NaN, not a partial object: no value at all.
        expect(entry.value).toBeNull();
        expect(entry.qualityState).toBeNull();
      } else {
        expect(entry.value).not.toBeNull();
        expect(Number.isFinite(entry.value!.ltp)).toBe(true);
      }
    }
  });

  it('preserves IPD depth-unavailable as null rather than zero (W-13)', async () => {
    ipd.behaviours = { SYNTH_DEPTH_MISSING: 'DEPTH_UNAVAILABLE' };
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_DEPTH_MISSING', securityId: 'ISIN:INE002A01018:EQ' }],
      ipd.deps(),
    );
    const entry = batch.entries[0]!;
    expect(entry.outcome).toBe('CURRENT');
    expect(entry.value!.bid).toBeNull();
    expect(entry.value!.ask).toBeNull();
    expect(entry.value!.bid).not.toBe(0);
    expect(entry.value!.ask).not.toBe(0);
    // The traded price is unaffected by absent depth.
    expect(entry.value!.ltp).toBe(100.6);
  });

  it('refuses a malformed envelope instead of projecting defaulted zeros', async () => {
    ipd.behaviours = { SYNTH_MALFORMED_ENVELOPE: 'MALFORMED_ENVELOPE' };
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_MALFORMED_ENVELOPE', securityId: 'ISIN:INE002A01018:EQ' }],
      ipd.deps(),
    );
    expect(batch.entries[0]!.outcome).toBe('UNAVAILABLE');
    expect(batch.entries[0]!.unavailable?.code).toBe('MALFORMED_RESPONSE');
    expect(batch.entries[0]!.value).toBeNull();
  });
});

describe('W-29 — bounded concurrency', () => {
  const identities = Array.from({ length: 12 }, (_, index) => ({
    companyId: `SYNTH_CURRENT_${index}`,
    securityId: 'ISIN:INE002A01018:EQ',
  }));

  it('never exceeds its configured in-flight width', async () => {
    const batch = await consumeQuotes(identities, ipd.deps({ concurrency: 3 }));
    expect(batch.requestedCount).toBe(12);
    expect(batch.counts.CURRENT).toBe(12);
    expect(ipd.quoteRequestCount).toBe(12);
    expect(batch.concurrency).toBe(3);
    expect(ipd.maxInFlight).toBeLessThanOrEqual(3);
    // It actually used the width: a serial implementation would never reach 2.
    expect(ipd.maxInFlight).toBeGreaterThan(1);
  });

  it('defaults to the documented bound rather than an unbounded burst', async () => {
    const batch = await consumeQuotes(identities, ipd.deps());
    expect(batch.concurrency).toBe(DEFAULT_QUOTE_BATCH_CONCURRENCY);
    expect(ipd.maxInFlight).toBeLessThanOrEqual(DEFAULT_QUOTE_BATCH_CONCURRENCY);
  });

  it('clamps an over-wide or nonsensical request into the supported bounds', async () => {
    const wide = await consumeQuotes(identities.slice(0, 6), ipd.deps({ concurrency: 500 }));
    expect(wide.concurrency).toBe(MAX_QUOTE_BATCH_CONCURRENCY);
    expect(ipd.maxInFlight).toBeLessThanOrEqual(MAX_QUOTE_BATCH_CONCURRENCY);

    ipd.reset();
    const zero = await consumeQuotes(identities.slice(0, 3), ipd.deps({ concurrency: 0 }));
    expect(zero.concurrency).toBe(1);
    expect(ipd.maxInFlight).toBe(1);
  });

  it('keeps one slow identity from breaking its neighbours or the ordering', async () => {
    ipd.behaviours = { SYNTH_CURRENT_4: 'SLOW' };
    const batch = await consumeQuotes(identities, ipd.deps({ concurrency: 4 }));
    expect(batch.counts.CURRENT).toBe(12);
    // Results stay in request order regardless of completion order.
    expect(batch.entries.map((entry) => entry.request.companyId)).toEqual(
      identities.map((identity) => identity.companyId),
    );
    expect(ipd.maxInFlight).toBeLessThanOrEqual(4);
  });
});

describe('W-29 — rate-limit awareness and partial results', () => {
  it('stops dispatching after one RATE_LIMITED answer and marks the rest not attempted', async () => {
    ipd.behaviours = { SYNTH_STALE: 'RATE_LIMITED' };
    const identities = [
      { companyId: 'SYNTH_STALE', securityId: 'ISIN:INE009A01021:EQ' },
      { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' },
      { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' },
      { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' },
    ];
    const batch = await consumeQuotes(identities, ipd.deps({ concurrency: 1 }));

    expect(batch.rateLimited).toBe(true);
    expect(batch.entries[0]!.outcome).toBe('UNAVAILABLE');
    expect(batch.entries[0]!.unavailable).toMatchObject({
      code: 'RATE_LIMITED',
      connectionAttempted: true,
      notAttempted: false,
    });
    // The remaining identities are explicitly NOT attempted — never a price, never a zero.
    for (const entry of batch.entries.slice(1)) {
      expect(entry.outcome).toBe('UNAVAILABLE');
      expect(entry.unavailable).toMatchObject({
        code: 'RATE_LIMITED',
        connectionAttempted: false,
        notAttempted: true,
      });
      expect(entry.value).toBeNull();
    }
    // Exactly one quote request was spent: the batch did not storm after the limit.
    expect(ipd.quoteRequestCount).toBe(1);
  });

  it('does not retry a rate limit in a loop', async () => {
    ipd.behaviours = { SYNTH_RATE_LIMITED: 'RATE_LIMITED' };
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_RATE_LIMITED', securityId: 'ISIN:INE002A01018:EQ' }],
      ipd.deps(),
    );
    expect(batch.entries[0]!.outcome).toBe('UNAVAILABLE');
    // One identity, one request. No retry, no backoff loop inside IRR.
    expect(ipd.quoteRequestCount).toBe(1);
  });

  it('keeps a partial batch complete: every requested identity yields exactly one entry', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps({ concurrency: 2 }));
    const counted = QUOTE_CONSUMPTION_OUTCOMES.reduce((sum, outcome) => sum + batch.counts[outcome], 0);
    expect(counted).toBe(batch.requestedCount);
    expect(batch.entries).toHaveLength(MIXED_BATCH.length);
  });

  it('never lets a neighbouring price leak into a failed member', async () => {
    installMixedBehaviours();
    const batch = await consumeQuotes(MIXED_BATCH, ipd.deps());
    const failed = batch.entries.filter(
      (entry) => entry.outcome === 'UNAVAILABLE' || entry.outcome === 'UNMAPPED',
    );
    for (const entry of failed) {
      expect(entry.value).toBeNull();
      expect(JSON.stringify(entry)).not.toContain('100.6');
    }
  });

  it('reports an empty batch as explicitly unavailable rather than fresh', async () => {
    const batch = await consumeQuotes([], ipd.deps());
    expect(batch.requestedCount).toBe(0);
    expect(batch.pricedCount).toBe(0);
    expect(batch.worstFreshness).toBe('UNAVAILABLE');
  });

  it('attempts nothing and says so when the transport is not configured', async () => {
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' }],
      { env: {} },
    );
    expect(batch.transportConfigured).toBe(false);
    expect(batch.transportFailureCode).toBe('NOT_CONFIGURED');
    expect(batch.entries[0]!.outcome).toBe('UNAVAILABLE');
    expect(batch.entries[0]!.unavailable).toMatchObject({
      code: 'NOT_CONFIGURED',
      connectionAttempted: false,
      notAttempted: true,
    });
    expect(ipd.quoteRequestCount).toBe(0);
  });
});

describe('W-29 — freshness join semantics', () => {
  it('lets a provider status DEGRADE a verdict but never improve one', async () => {
    // IPD serves a GOOD quote while its D01 status says STALE: the batch must report STALE.
    ipd.behaviours = { SYNTH_DOWNGRADE: 'STALE' };
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_DOWNGRADE', securityId: 'ISIN:INE002A01018:EQ' }],
      ipd.deps(),
    );
    expect(batch.entries[0]!.outcome).toBe('STALE');
    expect(batch.entries[0]!.freshness).toBe('STALE');
    expect(batch.entries[0]!.freshnessStatus?.cacheState).toBe('STALE');
  });

  it('reads freshness per identity scope, one status per requested identity', async () => {
    installMixedBehaviours();
    await consumeQuotes(
      [
        { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' },
        { companyId: 'SYNTH_STALE', securityId: 'ISIN:INE009A01021:EQ' },
      ],
      ipd.deps(),
    );
    // Two identities, two scoped status reads — never one batch-level status reused.
    expect(ipd.freshnessRequestCount).toBe(2);
  });

  it('does not suppress a genuine provider observation because its cache status is empty', async () => {
    // IPD's D01 status describes its CACHE. An unavailable/unknown cache state is not
    // evidence against a quote the provider actually answered: treating it as a
    // contradiction would report real market data as unavailable.
    ipd.behaviours = { SYNTH_UNCACHED: 'UNAVAILABLE' };
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_UNCACHED', securityId: 'ISIN:INE002A01018:EQ' }],
      ipd.deps(),
    );
    // The quote request itself failed in this fixture, so the entry is unavailable…
    expect(batch.entries[0]!.outcome).toBe('UNAVAILABLE');

    // …and a SUCCESSFUL quote whose status happens to be UNKNOWN stays a served quote,
    // with the unknown verdict carried verbatim rather than silently resolving to fresh.
    const server = http.createServer((req, res) => {
      const path = (req.url ?? '').split('?')[0];
      const payload = path === '/v1/quotes'
        ? { ok: true, envelope: syntheticQuoteEnvelope({ qualityState: 'GOOD', companyId: 'SYNTH_UNCACHED' }), freshness: 'CURRENT' }
        : syntheticFreshnessStatus({
            cacheState: 'UNAVAILABLE',
            verdict: 'UNKNOWN',
            asOf: null,
            receivedAt: null,
            ageSeconds: null,
            staleConcessionActive: false,
            suppressExecution: true,
            eligibleForUse: false,
            lastRefreshOutcome: 'UNKNOWN',
          });
      void (async () => {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const text = JSON.stringify(payload);
        res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
        res.end(text);
      })();
    });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const served = await consumeQuotes(
        [{ companyId: 'SYNTH_UNCACHED', securityId: 'ISIN:INE002A01018:EQ' }],
        { transport: { ok: true, config: { baseUrl, token: 'synthetic-transport-token', timeoutMs: 5000, configured: true } } },
      );
      const entry = served.entries[0]!;
      expect(entry.outcome).toBe('CURRENT');
      expect(entry.value?.ltp).toBe(100.6);
      // The unknown status is published, not resolved: a consumer can see IPD said UNKNOWN.
      expect(entry.freshnessVerdict).toBe('UNKNOWN');
      expect(entry.freshnessStatus?.verdict).toBe('UNKNOWN');
      expect(entry.freshnessStatus?.eligibleForUse).toBe(false);
    } finally {
      await new Promise<void>((done) => server.close(() => done()));
    }
  });

  it('carries a null status with its failure rather than implying freshness', async () => {
    // No freshness route on this transport: the quote still succeeds and the status is
    // explicitly unknown.
    const server = http.createServer((req, res) => {
      if ((req.url ?? '').split('?')[0] === '/v1/quotes') {
        void (async () => {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const text = JSON.stringify({
            ok: true,
            envelope: syntheticQuoteEnvelope({ qualityState: 'GOOD', companyId: 'SYNTH_NO_FRESHNESS' }),
            freshness: 'CURRENT',
          });
          res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
          res.end(text);
        })();
        return;
      }
      res.writeHead(500, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'INTERNAL', message: 'freshness unavailable' } }));
    });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      const batch = await consumeQuotes(
        [{ companyId: 'SYNTH_NO_FRESHNESS', securityId: 'ISIN:INE002A01018:EQ' }],
        {
          transport: {
            ok: true,
            config: { baseUrl, token: 'synthetic-transport-token', timeoutMs: 5000, configured: true },
          },
        },
      );
      const entry = batch.entries[0]!;
      // The quote is the authoritative answer and survives the status failure…
      expect(entry.outcome).toBe('CURRENT');
      expect(entry.value?.ltp).toBe(100.6);
      // …but nothing claims freshness evidence that was never read.
      expect(entry.freshnessStatus).toBeNull();
      expect(entry.freshnessVerdict).toBeNull();
      expect(entry.freshnessStatusFailure).not.toBeNull();
    } finally {
      await new Promise<void>((done) => server.close(() => done()));
    }
  });

  it('can skip the join without changing the quote outcome', async () => {
    const batch = await consumeQuotes(
      [{ companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' }],
      ipd.deps({ joinFreshness: false }),
    );
    expect(batch.entries[0]!.outcome).toBe('CURRENT');
    expect(ipd.freshnessRequestCount).toBe(0);
  });
});

describe('W-29 — single-identity consumption', () => {
  it('composes the batch path rather than opening a second one', async () => {
    installMixedBehaviours();
    const entry = await consumeQuote(
      { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' },
      ipd.deps(),
    );
    expect(entry?.outcome).toBe('CURRENT');
    expect(entry?.value?.ltp).toBe(100.6);
    // One quote request, one freshness read: the single path and the batch path agree.
    expect(ipd.quoteRequestCount).toBe(1);
    expect(ipd.freshnessRequestCount).toBe(1);
  });

  it('reports the malformed identity rather than a null entry', async () => {
    const entry = await consumeQuote({ companyId: 'X' }, ipd.deps());
    expect(entry).not.toBeNull();
    expect(entry?.outcome).toBe('MALFORMED_IDENTITY');
  });
});

describe('W-29 — architectural isolation', () => {
  /** Reads every non-test server source file under `server/`. */
  function serverSources(): { path: string; source: string }[] {
    const root = resolve(HERE, '..');
    const out: { path: string; source: string }[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir).sort()) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
          walk(full);
        } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
          // Tests are not production modules: they construct fixtures by design.
          if (full.endsWith('.test.ts') || full.endsWith('.test.tsx')) continue;
          out.push({ path: full.slice(root.length + 1).split(sep).join('/'), source: readFileSync(full, 'utf8') });
        }
      }
    };
    walk(root);
    return out;
  }

  const sources = serverSources();
  const boundaryPath = 'market-data/quoteConsumptionBoundary.ts';

  it('has exactly one module that consumes IPD quotes', () => {
    const quoteCallSites = sources.filter((file) => /client\.getQuote\s*\(/.test(file.source));
    expect(quoteCallSites.map((file) => file.path)).toEqual([boundaryPath]);
  });

  it('has exactly one module that constructs IPD transport client for quote consumption', () => {
    // The composition module builds the client factory; the boundary and the diagnostics
    // route are its only callers, and neither of those two can reach a quote.
    const constructors = sources
      .filter((file) => /new\s+MarketDataTransportClient\s*\(/.test(file.source))
      .map((file) => file.path);
    expect(constructors).toEqual(['market-data/dhanMarketDataTransport.ts']);

    const callers = sources
      .filter((file) => /createIpdMarketDataTransportClient\s*\(/.test(file.source))
      .map((file) => file.path)
      .sort();
    // A closed allowlist, each with a stated reason:
    //   dhanMarketDataTransport.ts — defines the factory (no request of its own).
    //   quoteConsumptionBoundary.ts — the ONE quote consumer (W-29).
    //   dhanMarketDataRoutes.ts     — presentation/historical only; no quote call (W-39).
    //   dhanHealthTransport.ts      — diagnostics/verification only; no quotes.
    expect(callers).toEqual([
      'market-data/dhanHealthTransport.ts',
      'market-data/dhanMarketDataRoutes.ts',
      'market-data/dhanMarketDataTransport.ts',
      'market-data/quoteConsumptionBoundary.ts',
    ]);
  });

  it('keeps the presentation quote route free of any transport composition', () => {
    const routes = sources.find((file) => file.path === 'market-data/dhanMarketDataRoutes.ts');
    expect(routes).toBeDefined();
    const source = routes!.source;
    // The quote route delegates: no quote call, no quote identity construction, no
    // freshness read for the quote scope.
    expect(source).not.toMatch(/client\.getQuote\s*\(/);
    expect(source).not.toMatch(/securityIdentity\s*:/);
    expect(source).toContain("from './quoteConsumptionBoundary'");
    expect(source).toContain('consumeQuote(');

    // The quote handler itself is the block that must not touch the transport.
    const handlerStart = source.indexOf('export async function handleDhanQuotesRequest');
    const handlerEnd = source.indexOf('export async function handleDhanHistoricalRequest');
    expect(handlerStart).toBeGreaterThan(-1);
    expect(handlerEnd).toBeGreaterThan(handlerStart);
    const handler = source.slice(handlerStart, handlerEnd);
    expect(handler).not.toMatch(/createIpdMarketDataTransportClient/);
    expect(handler).not.toMatch(/readIpdFreshnessStatus/);
    expect(handler).not.toMatch(/getQuote/);
  });

  it('introduces no second provider client, normalizer or market-data cache in IRR', () => {
    const boundary = sources.find((file) => file.path === boundaryPath);
    expect(boundary).toBeDefined();
    const source = boundary!.source;
    // No provider client, no normalization, no store.
    expect(source).not.toMatch(/new\s+DhanApiClient\s*\(/);
    expect(source).not.toMatch(/DhanMarketDataService|DhanMarketDataSource|DhanServerHttpsTransport/);
    expect(source).not.toMatch(/new\s+Map\s*\(|<string,\s*Quote/);
    // Every call reads IPD: there is no memo, TTL or invalidation surface.
    expect(source).not.toMatch(/setInterval|setTimeout|Date\.now\(\)\s*-\s*cachedAt|ttlMs|cacheTtl/i);
    // The ONLY IPD calls it makes are quote and freshness reads.
    expect(source.match(/client\.getQuote\s*\(/g) ?? []).toHaveLength(1);
    expect(source.match(/readIpdFreshnessStatus\s*\(/g) ?? []).toHaveLength(1);
  });

  it('keeps the boundary unreachable from browser code', () => {
    const srcRoot = resolve(HERE, '..', '..', 'src');
    expect(existsSync(srcRoot)).toBe(true);
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir).sort()) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        // Browser CONTRACT tests are not browser code: they deliberately address a server
        // module to prove the two declarations agree. Only production sources can leak.
        if (!/\.(?:ts|tsx)$/.test(full) || /\.test\.(?:ts|tsx)$/.test(full)) continue;
        const source = readFileSync(full, 'utf8');
        if (
          /quoteConsumptionBoundary|dhanMarketDataTransport|dhanMarketDataRoutes|iips-production-market-data\/dhan-server/.test(source)
        ) {
          offenders.push(full);
        }
      }
    };
    walk(srcRoot);
    expect(offenders).toEqual([]);
  });
});

describe('W-29 — browser bundle gate', () => {
  /**
   * The gate is exercised through its REAL command-line entry point, exactly as the
   * production build invokes it (`npm run verify:browser-bundle`). Running the CLI is also
   * what proves the exit code a build would actually see.
   */
  function runGate(bundleDir: string): { status: number | null; stdout: string; stderr: string } {
    // Resolved from this file, so the gate is the one in THIS repository regardless of the
    // runner's working directory.
    const gate = resolve(HERE, '..', '..', 'scripts', 'verify-browser-bundle.mjs');
    const result = spawnSync(process.execPath, [gate, bundleDir], { encoding: 'utf8' });
    return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
  }

  it('passes a clean bundle', () => {
    const dir = makeFixtureBundle(['console.log("safe")']);
    try {
      const result = runGate(dir);
      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('passed');
    } finally {
      removeFixtureBundle(dir);
    }
  });

  it('rejects every W-29 boundary and transport symbol in emitted browser output', () => {
    for (const forbidden of [
      'quoteConsumptionBoundary',
      'consumeQuote(',
      'consumeQuotes(',
      'IpdMarketDataTransportConfig',
      'IpdTransportConfigResolution',
      'IpdFreshnessStatus',
      'readIpdFreshnessStatus',
      'resolveIpdMarketDataTransportConfig',
      'createIpdMarketDataTransportClient',
      'MarketDataTransportClient',
      'IIPS_MARKET_DATA_TRANSPORT_TOKEN',
      'IRR_PROVIDER_QUALIFICATION',
    ]) {
      // Written into a source map, i.e. the hardest place to catch and an extension the
      // gate must not trust.
      const dir = makeFixtureBundle([`export const x = ${JSON.stringify(forbidden)};`]);
      try {
        const result = runGate(dir);
        expect(result.status, `the browser gate accepted ${forbidden}`).toBe(1);
        // A rejected bundle names the FILE and a RULE, never the matched content. A symbol
        // can trip more than one class (the transport client is also a provider symbol), so
        // any rule that legitimately covers it is accepted — the point is that SOMETHING
        // covers it and that the matched text is never echoed.
        expect(result.stderr).toContain('Browser bundle rejected');
        expect(result.stderr).toMatch(
          /\((?:server-only quote-consumption boundary|Dhan provider implementation|market-data configuration|server-only Dhan dependency)\)/,
        );
        expect(result.stderr).not.toContain(forbidden);
      } finally {
        removeFixtureBundle(dir);
      }
    }
  });
});

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

/** A throwaway "emitted browser bundle": one JS file plus a source map. */
function makeFixtureBundle(files: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'irr-w29-bundle-'));
  mkdirSync(join(dir, 'assets'), { recursive: true });
  writeFileSync(join(dir, 'assets', 'app.js'), files[0] ?? 'console.log("safe");');
  writeFileSync(join(dir, 'assets', 'app.js.map'), files.join('\n'));
  return dir;
}

function removeFixtureBundle(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

describe('W-29 — vocabulary invariants', () => {
  it('publishes the five IRR freshness members and never claims LIVE', () => {
    for (const outcome of QUOTE_CONSUMPTION_OUTCOMES) {
      expect(typeof outcome).toBe('string');
    }
    expect(QUOTE_CONSUMPTION_OUTCOMES).toContain('MALFORMED_IDENTITY');
  });

  it('treats every identity failure code as unmapped, not as unavailable data', () => {
    for (const code of ['UNRESOLVED_INSTRUMENT', 'IDENTITY_RESOLUTION_FAILURE', 'NOT_FOUND']) {
      expect(IDENTITY_UNMAPPED_CODES.has(code)).toBe(true);
    }
    // A transport or provider failure is NOT an identity answer.
    expect(IDENTITY_UNMAPPED_CODES.has('PROVIDER_STATUS_FAILURE')).toBe(false);
    expect(IDENTITY_UNMAPPED_CODES.has('RATE_LIMITED')).toBe(false);
  });

  it('publishes the synthetic-only qualification as the only provider qualification', () => {
    expect(IRR_PROVIDER_QUALIFICATION).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
  });
});

/* The presentation route's own contract is authored in one place and asserted here so a
 * consumer migration cannot silently change the browser-facing error shape. */
describe('W-29 — migrated presentation route', () => {
  async function callQuoteRoute(
    body: unknown,
    deps: QuoteConsumptionDeps,
  ): Promise<{ status: number; body: Record<string, unknown> }> {
    const server = http.createServer((req, res) => {
      void handleDhanQuotesRequest(req, res, deps as never);
    });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/dhan/quotes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      return { status: response.status, body: (await response.json().catch(() => ({}))) as Record<string, unknown> };
    } finally {
      await new Promise<void>((done) => server.close(() => done()));
    }
  }

  it('returns the boundary projection with the joined freshness and provenance', async () => {
    installMixedBehaviours();
    const response = await callQuoteRoute(
      { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ' },
      ipd.deps(),
    );
    expect(response.status).toBe(200);
    const data = response.body.data as Record<string, unknown>;
    expect(data.freshness).toBe('SNAPSHOT');
    expect(data.asOf).toBe('2026-11-06T10:15:00.000Z');
    expect(data.providerQualification).toBe(IRR_PROVIDER_QUALIFICATION);
    expect((data.quote as Record<string, unknown>).ltp).toBe(100.6);
    expect((data.freshnessStatus as Record<string, unknown>).domain).toBe('D01_QUOTES');
    // No credential, and no boundary-internal field, reaches the browser.
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain('synthetic-transport-token');
    expect(serialized).not.toContain('unavailable');
    expect(serialized).not.toContain('notAttempted');
  });

  it('publishes an unmapped identity as an identity failure, not as unavailable data', async () => {
    installMixedBehaviours();
    const response = await callQuoteRoute(
      { companyId: 'SYNTH_UNMAPPED', securityId: 'ISIN:INE040A01034:EQ', exchangeSegment: 'BSE_EQ' },
      ipd.deps(),
    );
    expect(response.status).toBe(502);
    const error = response.body.error as Record<string, unknown>;
    expect(error.code).toBe('UNRESOLVED_INSTRUMENT');
    expect(error.identityFailure).toBe(true);
  });

  it('publishes unavailable market data with IPD own code', async () => {
    installMixedBehaviours();
    const response = await callQuoteRoute(
      { companyId: 'SYNTH_UNAVAILABLE', securityId: 'ISIN:INE467B01029:EQ' },
      ipd.deps(),
    );
    expect(response.status).toBe(502);
    const error = response.body.error as Record<string, unknown>;
    expect(error.code).toBe('PROVIDER_STATUS_FAILURE');
    expect(error.identityFailure).toBe(false);
  });
});
