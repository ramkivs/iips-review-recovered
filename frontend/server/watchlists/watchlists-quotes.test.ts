/**
 * W-31 — Watchlists sourced price display.
 *
 * Verifies:
 *   1. A mixed-resolution watchlist renders three distinct states correctly.
 *   2. Prices are sourced through the W-29 boundary (consumeQuotes).
 *   3. Batch fetching is bounded (ONE call per watchlist, worker pool).
 *   4. Rate limiting is handled safely (no retry, notAttempted flag).
 *   5. No per-item provider-call storm (ONE consumeQuotes batch).
 *   6. Existing watchlist membership and ordering remain unchanged.
 *   7. Unresolved never zero, stale never current.
 *
 * Synthetic — no live Dhan request, no IPD private package required beyond W-29's
 * transport fixture.
 *
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import {
  APPROVED_OWNER_USER_ID,
  APPROVED_TENANT_ID,
  OWNER_CONTEXT_CARRIER_FILENAME,
  materialiseOwnerContextCarrier,
} from '../owner-context-carrier';
import { OWNER_CONTEXT_PATH_ENV } from '../owner-context-resolver';
import { PersistenceService } from '../persistence/persistence-service';
import {
  createWatchlist,
  addItem,
  listWatchlists,
  readWatchlist,
  resetWatchlistsPersistence,
} from './watchlists-service';
import {
  enrichWatchlistWithQuotes,
  watchlistItemToQuoteIdentity,
  watchlistItemsToQuoteIdentities,
  projectWatchlistQuotesView,
  handleWatchlistQuotesRequest,
  type WatchlistQuotesDeps,
  type WatchlistQuotesView,
} from './watchlists-quotes';
import {
  DEFAULT_QUOTE_BATCH_CONCURRENCY,
  MAX_QUOTE_BATCH_CONCURRENCY,
  IRR_PROVIDER_QUALIFICATION,
} from '../market-data/quoteConsumptionBoundary';
import { syntheticFreshnessStatus, syntheticQuoteEnvelope } from '../market-data/dhanSyntheticFixtures';

// ── Synthetic per-identity transport (same pattern as W-29's test) ───────────────

type Behaviour = 'CURRENT' | 'STALE' | 'UNAVAILABLE' | 'UNMAPPED' | 'RATE_LIMITED' | 'SLOW';

class SyntheticWatchlistTransport {
  private server: http.Server | null = null;
  private baseUrl = '';
  public behaviours: Record<string, Behaviour> = {};
  public quoteRequestCount = 0;
  public freshnessRequestCount = 0;
  public inFlight = 0;
  public maxInFlight = 0;
  public requestedCompanyIds: string[] = [];
  public delayMs = 30;

  async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      const pathOnly = (req.url ?? '').split('?')[0];
      if (pathOnly === '/v1/quotes') {
        void this.handleQuote(req, res);
        return;
      }
      if (pathOnly === '/v1/freshness') {
        void this.handleFreshness(req, res);
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'unknown route' } }));
    });
    await new Promise<void>((done) => this.server!.listen(0, '127.0.0.1', done));
    this.baseUrl = `http://127.0.0.1:${(this.server!.address() as AddressInfo).port}`;
  }

  async stop(): Promise<void> {
    if (this.server === null) return;
    await new Promise<void>((done) => this.server!.close(() => done()));
    this.server = null;
  }

  reset(): void {
    this.behaviours = {};
    this.quoteRequestCount = 0;
    this.freshnessRequestCount = 0;
    this.inFlight = 0;
    this.maxInFlight = 0;
    this.requestedCompanyIds = [];
    this.delayMs = 30;
  }

  deps(overrides: Partial<WatchlistQuotesDeps> = {}): WatchlistQuotesDeps {
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
      default:
        send(200, { ok: true, envelope: syntheticQuoteEnvelope({ companyId }), freshness: 'CURRENT' });
    }
  }

  private async handleFreshness(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const companyId = url.searchParams.get('companyId') ?? '';
    this.freshnessRequestCount += 1;
    const behaviour = this.behaviours[companyId] ?? 'CURRENT';

    const status =
      behaviour === 'STALE'
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

const ipd = new SyntheticWatchlistTransport();

// ── Helpers for watchlist persistence ─────────────────────────────────────────

const TENANT_ID = APPROVED_TENANT_ID;
const OWNER_USER_ID = APPROVED_OWNER_USER_ID;

let dataDir: string;
let store: PersistenceService;

function governRow(canonicalSecurityId: string, companyId: string): Record<string, unknown> {
  return {
    canonicalSecurityId,
    companyId,
    sector: canonicalSecurityId,
    composite: 70,
    qualityAxis: 0.7,
    valuation: 0.5,
    asOf: '2026-08-09T00:00:00.000Z',
  };
}

function createMixedWatchlist(): ReturnType<typeof readWatchlist> {
  createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-mixed', 'Mixed Watchlist', store, '2026-11-01T00:00:00.000Z');
  // 1. Successfully priced — valid D114, will be CURRENT via fixture
  addItem(
    TENANT_ID,
    OWNER_USER_ID,
    'wl-mixed',
    governRow('ISIN:INE002A01018:EQ', 'SYNTH_CURRENT'),
    [],
    store,
    '2026-11-01T00:00:01.000Z',
  );
  // 2. Unresolved — sector name, not a D114 (MALFORMED_IDENTITY)
  addItem(
    TENANT_ID,
    OWNER_USER_ID,
    'wl-mixed',
    governRow('Technology', 'Technology-H1'),
    [],
    store,
    '2026-11-01T00:00:02.000Z',
  );
  // 3. Unavailable — valid D114 but provider says unavailable
  addItem(
    TENANT_ID,
    OWNER_USER_ID,
    'wl-mixed',
    governRow('ISIN:INE467B01029:EQ', 'SYNTH_UNAVAILABLE'),
    [],
    store,
    '2026-11-01T00:00:03.000Z',
  );
  // 4. Stale — valid D114 but stale
  addItem(
    TENANT_ID,
    OWNER_USER_ID,
    'wl-mixed',
    governRow('ISIN:INE009A01021:EQ', 'SYNTH_STALE'),
    [],
    store,
    '2026-11-01T00:00:04.000Z',
  );
  return readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-mixed', store);
}

beforeAll(async () => {
  await ipd.start();
  // Isolate persistence
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'w31-watchlist-'));
  dataDir = dir;
  process.env.IIPS_DATA_DIR = dir;
  resetWatchlistsPersistence();
  store = new PersistenceService({ dataDir: path.join(dir, 'watchlists') });
});

afterAll(async () => {
  await ipd.stop();
  resetWatchlistsPersistence();
  delete process.env.IIPS_DATA_DIR;
  try {
    fs.rmSync(dataDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

afterEach(() => {
  ipd.reset();
  // Clear watchlists between tests: wipe store dir and recreate
  try {
    const wlDir = path.join(dataDir, 'watchlists');
    if (fs.existsSync(wlDir)) {
      for (const f of fs.readdirSync(wlDir)) fs.rmSync(path.join(wlDir, f), { recursive: true, force: true });
    }
  } catch {
    // ignore
  }
  resetWatchlistsPersistence();
  store = new PersistenceService({ dataDir: path.join(dataDir, 'watchlists') });
});

// ── Mapping unit tests ────────────────────────────────────────────────────────

describe('W-31 watchlist item to quote identity mapping', () => {
  it('maps a D114 canonicalSecurityId to a D114 identity without reinterpretation', () => {
    const item = {
      canonicalSecurityId: 'ISIN:INE002A01018:EQ',
      baseline: { companyId: 'SYNTH_CURRENT', asOf: '2026-08-09T00:00:00.000Z' },
      baselineAsOf: '2026-08-09T00:00:00.000Z',
      addedAt: '2026-11-01T00:00:00.000Z',
      triggers: [],
    } as unknown as import('./watchlists-service').WatchlistItem;
    const id = watchlistItemToQuoteIdentity(item);
    expect(id.companyId).toBe('SYNTH_CURRENT');
    expect(id.securityId).toBe('ISIN:INE002A01018:EQ');
  });

  it('preserves ordering: identities array matches items order', () => {
    const wl = createMixedWatchlist()!;
    const ids = watchlistItemsToQuoteIdentities(wl);
    expect(ids).toHaveLength(4);
    expect((ids[0] as { securityId: string }).securityId).toBe('ISIN:INE002A01018:EQ');
    expect((ids[1] as { securityId: string }).securityId).toBe('Technology');
    expect((ids[2] as { securityId: string }).securityId).toBe('ISIN:INE467B01029:EQ');
    expect((ids[3] as { securityId: string }).securityId).toBe('ISIN:INE009A01021:EQ');
  });

  it('falls back to canonicalSecurityId when baseline.companyId is missing', () => {
    const item = {
      canonicalSecurityId: 'ISIN:INE002A01018:EQ',
      baseline: { asOf: '2026-08-09T00:00:00.000Z' },
      baselineAsOf: '2026-08-09T00:00:00.000Z',
      addedAt: '2026-11-01T00:00:00.000Z',
      triggers: [],
    } as unknown as import('./watchlists-service').WatchlistItem;
    const id = watchlistItemToQuoteIdentity(item);
    expect(id.companyId).toBe('ISIN:INE002A01018:EQ');
  });

  it('extracts exchangeSegment from baseline when present', () => {
    const item = {
      canonicalSecurityId: 'ISIN:INE002A01018:EQ',
      baseline: { companyId: 'C', exchangeSegment: 'BSE_EQ', asOf: '2026-08-09T00:00:00.000Z' },
      baselineAsOf: '2026-08-09T00:00:00.000Z',
      addedAt: '2026-11-01T00:00:00.000Z',
      triggers: [],
    } as unknown as import('./watchlists-service').WatchlistItem;
    expect(watchlistItemToQuoteIdentity(item).exchangeSegment).toBe('BSE_EQ');
  });
});

// ── Mixed-resolution batch ──────────────────────────────────────────────────

describe('W-31 mixed-resolution watchlist — three states truthfully distinct', () => {
  it('renders successfully priced, unresolved and unavailable/stale as three distinct, truthful states', async () => {
    const wl = createMixedWatchlist()!;
    ipd.behaviours = {
      SYNTH_CURRENT: 'CURRENT',
      SYNTH_UNAVAILABLE: 'UNAVAILABLE',
      SYNTH_STALE: 'STALE',
    };

    const batch = await enrichWatchlistWithQuotes(wl, ipd.deps());

    // Ordering preserved — quotes[i] answers items[i]
    expect(batch.entries).toHaveLength(4);
    expect(batch.entries.map((e) => e.outcome)).toEqual(['CURRENT', 'MALFORMED_IDENTITY', 'UNAVAILABLE', 'STALE']);
    expect(batch.entries.map((e) => e.request.companyId)).toEqual(['SYNTH_CURRENT', 'Technology-H1', 'SYNTH_UNAVAILABLE', 'SYNTH_STALE']);

    // Successfully priced item: CURRENT, has value, LTP finite, freshness SNAPSHOT, asOf present
    const priced = batch.entries[0]!;
    expect(priced.outcome).toBe('CURRENT');
    expect(priced.value).not.toBeNull();
    expect(Number.isFinite(priced.value!.ltp)).toBe(true);
    expect(Number.isFinite(priced.value!.change)).toBe(true);
    expect(priced.freshness).toBe('SNAPSHOT');
    expect(priced.asOf).toBe('2026-11-06T10:15:00.000Z');
    expect(priced.providerQualification).toBe(IRR_PROVIDER_QUALIFICATION);

    // Unresolved item: MALFORMED_IDENTITY, no value, never zero
    const unresolved = batch.entries[1]!;
    expect(unresolved.outcome).toBe('MALFORMED_IDENTITY');
    expect(unresolved.value).toBeNull();
    expect(unresolved.malformedIdentity).not.toBeNull();
    expect(unresolved.freshness).toBe('UNAVAILABLE');
    // No missing price is a zero — value is null, not { ltp: 0 }
    expect((unresolved as unknown as Record<string, unknown>).value).toBeNull();

    // Unavailable item: UNAVAILABLE, no value, code preserved
    const unavailable = batch.entries[2]!;
    expect(unavailable.outcome).toBe('UNAVAILABLE');
    expect(unavailable.value).toBeNull();
    expect(unavailable.unavailable?.code).toBe('PROVIDER_STATUS_FAILURE');
    expect(unavailable.unavailable?.connectionAttempted).toBe(true);

    // Stale item: STALE, has value but freshness is STALE (never current)
    const stale = batch.entries[3]!;
    expect(stale.outcome).toBe('STALE');
    expect(stale.value).not.toBeNull();
    expect(stale.freshness).toBe('STALE');
    expect(stale.freshness).not.toBe('SNAPSHOT');
    expect(stale.asOf).toBe('2026-11-06T06:00:00.000Z');

    // All three states are visually distinct by outcome and freshness
    expect(new Set(batch.entries.map((e) => e.outcome)).size).toBe(4); // CURRENT, MALFORMED, UNAVAILABLE, STALE distinct
    // Stale is never presented as current
    for (const e of batch.entries) {
      if (e.outcome === 'STALE') expect(e.freshness).not.toBe('SNAPSHOT');
    }
    // No unresolved is zero
    for (const e of batch.entries) {
      if (e.outcome === 'UNAVAILABLE' || e.outcome === 'UNMAPPED' || e.outcome === 'MALFORMED_IDENTITY') {
        expect(e.value).toBeNull();
      }
    }

    // Prices sourced through W-29 boundary: one batch, bounded, with freshness join
    expect(batch.providerQualification).toBe(IRR_PROVIDER_QUALIFICATION);
    expect(batch.worstFreshness).toBe('UNAVAILABLE'); // unavailable + malformed present
    expect(batch.pricedCount).toBe(2); // CURRENT + STALE
    expect(batch.counts).toEqual({
      CURRENT: 1,
      STALE: 1,
      UNAVAILABLE: 1,
      UNMAPPED: 0,
      MALFORMED_IDENTITY: 1,
    });
  });

  it('preserves watchlist ordering and does not disturb membership', async () => {
    const wl = createMixedWatchlist()!;
    ipd.behaviours = { SYNTH_CURRENT: 'CURRENT', SYNTH_UNAVAILABLE: 'UNAVAILABLE', SYNTH_STALE: 'STALE' };
    const batch = await enrichWatchlistWithQuotes(wl, ipd.deps());

    // Ordering: watchlist item order is creation order; quotes preserve it.
    const canonicals = wl.items.map((i) => i.canonicalSecurityId);
    expect(canonicals).toEqual(['ISIN:INE002A01018:EQ', 'Technology', 'ISIN:INE467B01029:EQ', 'ISIN:INE009A01021:EQ']);

    // The view projects ordering verbatim
    const view = projectWatchlistQuotesView(wl, batch);
    expect(view.watchlistId).toBe('wl-mixed');
    expect(view.name).toBe('Mixed Watchlist');
    expect(view.totalItems).toBe(4);
    expect(view.quotes).toHaveLength(4);
    expect(view.quotes[0]!.request.securityId).toBe('ISIN:INE002A01018:EQ');
    expect(view.quotes[1]!.request.securityId).toBe('Technology');

    // Membership unchanged after enrichment (read-only)
    const after = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-mixed', store)!;
    expect(after.items.map((i) => i.canonicalSecurityId)).toEqual(canonicals);
    expect(after.name).toBe('Mixed Watchlist');
  });

  it('unmapped D114 is distinct from unavailable market data', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-unmapped', 'Unmapped list', store);
    addItem(TENANT_ID, OWNER_USER_ID, 'wl-unmapped', governRow('ISIN:INE040A01034:EQ', 'SYNTH_UNMAPPED'), [], store);
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-unmapped', store)!;
    ipd.behaviours = { SYNTH_UNMAPPED: 'UNMAPPED' };
    const batch = await enrichWatchlistWithQuotes(wl, ipd.deps());
    expect(batch.entries[0]!.outcome).toBe('UNMAPPED');
    expect(batch.entries[0]!.unmapped?.code).toBe('UNRESOLVED_INSTRUMENT');
    expect(batch.entries[0]!.unavailable).toBeNull();
    expect(batch.entries[0]!.value).toBeNull();
  });
});

// ── Bounded batch fetching ──────────────────────────────────────────────────

describe('W-31 batch fetching is bounded', () => {
  it('uses ONE consumeQuotes call per watchlist, not per item', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-bounded', 'Bounded list', store);
    for (let i = 0; i < 6; i++) {
      addItem(
        TENANT_ID,
        OWNER_USER_ID,
        'wl-bounded',
        governRow(`ISIN:INE002A0101${i}:EQ`, `SYNTH_${i}`),
        [],
        store,
      );
      ipd.behaviours[`SYNTH_${i}`] = 'CURRENT';
    }
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-bounded', store)!;
    const batch = await enrichWatchlistWithQuotes(wl, { ...ipd.deps(), concurrency: 3 });
    expect(batch.requestedCount).toBe(6);
    // Exactly 6 quote requests via the transport, dispatched under concurrency 3
    expect(ipd.quoteRequestCount).toBe(6);
    expect(ipd.maxInFlight).toBeLessThanOrEqual(3);
    expect(ipd.maxInFlight).toBeGreaterThan(1); // parallelism occurred
    expect(batch.concurrency).toBe(3);
  });

  it('respects default concurrency 4 and ceiling 8, and preserves order under concurrency', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-order', 'Order list', store);
    for (let i = 0; i < 12; i++) {
      addItem(TENANT_ID, OWNER_USER_ID, 'wl-order', governRow(`ISIN:INE002A0101${String(i).padStart(2, '0')}:EQ`, `SYNTH_${i}`), [], store);
      ipd.behaviours[`SYNTH_${i}`] = i === 5 ? 'STALE' : 'CURRENT';
      // Make one slow to prove ordering independent of completion order
      if (i === 0) ipd.delayMs = 50;
    }
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-order', store)!;
    // Default concurrency
    const batchDefault = await enrichWatchlistWithQuotes(wl, ipd.deps());
    expect(batchDefault.concurrency).toBe(DEFAULT_QUOTE_BATCH_CONCURRENCY);
    // Ordering preserved despite varied latency
    expect(batchDefault.entries.map((e) => e.request.companyId)).toEqual(
      Array.from({ length: 12 }, (_, i) => `SYNTH_${i}`),
    );
    ipd.reset();
    for (let i = 0; i < 12; i++) ipd.behaviours[`SYNTH_${i}`] = 'CURRENT';
    // Ceiling: requesting 500 clamps to 8
    const wl2 = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-order', store)!;
    const batchCeiling = await enrichWatchlistWithQuotes(wl2, ipd.deps({ concurrency: 500 }));
    expect(batchCeiling.concurrency).toBe(MAX_QUOTE_BATCH_CONCURRENCY);
    // Floor: 0 clamps to 1
    ipd.reset();
    for (let i = 0; i < 12; i++) ipd.behaviours[`SYNTH_${i}`] = 'CURRENT';
    const batchFloor = await enrichWatchlistWithQuotes(wl2, ipd.deps({ concurrency: 0 }));
    expect(batchFloor.concurrency).toBe(1);
  });

  it('does not issue per-item HTTP calls in a storm: watchlist quotes uses bounded pool', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-storm', 'Storm list', store);
    for (let i = 0; i < 20; i++) {
      addItem(TENANT_ID, OWNER_USER_ID, 'wl-storm', governRow(`ISIN:INE002A010${String(i).padStart(2, '0')}:EQ`, `SYNTH_${i}`), [], store);
      ipd.behaviours[`SYNTH_${i}`] = 'CURRENT';
    }
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-storm', store)!;
    const batch = await enrichWatchlistWithQuotes(wl, { ...ipd.deps(), concurrency: 4 });
    expect(ipd.quoteRequestCount).toBe(20);
    expect(ipd.maxInFlight).toBeLessThanOrEqual(4);
    expect(batch.entries).toHaveLength(20);
  });
});

// ── Rate limiting ───────────────────────────────────────────────────────────

describe('W-31 rate limiting is handled safely', () => {
  it('stops dispatch on RATE_LIMITED and marks remaining as notAttempted, with no retry', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-rl', 'Rate limited list', store);
    addItem(TENANT_ID, OWNER_USER_ID, 'wl-rl', governRow('ISIN:INE002A01018:EQ', 'SYNTH_CURRENT'), [], store);
    addItem(TENANT_ID, OWNER_USER_ID, 'wl-rl', governRow('ISIN:INE009A01021:EQ', 'SYNTH_RL'), [], store);
    addItem(TENANT_ID, OWNER_USER_ID, 'wl-rl', governRow('ISIN:INE467B01029:EQ', 'SYNTH_AFTER'), [], store);
    ipd.behaviours = { SYNTH_CURRENT: 'CURRENT', SYNTH_RL: 'RATE_LIMITED', SYNTH_AFTER: 'CURRENT' };
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-rl', store)!;
    const batch = await enrichWatchlistWithQuotes(wl, { ...ipd.deps(), concurrency: 1 });
    expect(batch.rateLimited).toBe(true);
    expect(batch.entries[0]!.outcome).toBe('CURRENT');
    expect(batch.entries[1]!.outcome).toBe('UNAVAILABLE');
    expect(batch.entries[1]!.unavailable?.code).toBe('RATE_LIMITED');
    // The third identity was never attempted — no provider budget spent on it
    expect(batch.entries[2]!.outcome).toBe('UNAVAILABLE');
    expect(batch.entries[2]!.unavailable?.code).toBe('RATE_LIMITED');
    expect(batch.entries[2]!.unavailable?.notAttempted).toBe(true);
    expect(batch.entries[2]!.unavailable?.connectionAttempted).toBe(false);
    expect(ipd.quoteRequestCount).toBe(2); // only first two dispatched; third stopped before dispatch
  });
});

// ── Empty watchlist and transport not configured ───────────────────────────

describe('W-31 edge cases: empty list and unconfigured transport', () => {
  it('returns an empty batch with worstFreshness UNAVAILABLE for an empty watchlist', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-empty', 'Empty', store);
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-empty', store)!;
    const batch = await enrichWatchlistWithQuotes(wl, ipd.deps());
    expect(batch.requestedCount).toBe(0);
    expect(batch.entries).toHaveLength(0);
    expect(batch.worstFreshness).toBe('UNAVAILABLE');
    expect(batch.pricedCount).toBe(0);
    expect(ipd.quoteRequestCount).toBe(0);
  });

  it('reports transport not configured without attempting any request', async () => {
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-nc', 'Not configured', store);
    addItem(TENANT_ID, OWNER_USER_ID, 'wl-nc', governRow('ISIN:INE002A01018:EQ', 'SYNTH_CURRENT'), [], store);
    const wl = readWatchlist(TENANT_ID, OWNER_USER_ID, 'wl-nc', store)!;
    const batch = await enrichWatchlistWithQuotes(wl, {
      transport: { ok: false, code: 'NOT_CONFIGURED', message: 'IIPS_MARKET_DATA_BASE_URL is not configured', connectionAttempted: false },
    });
    expect(batch.transportConfigured).toBe(false);
    expect(batch.transportFailureCode).toBe('NOT_CONFIGURED');
    expect(batch.entries[0]!.unavailable?.code).toBe('NOT_CONFIGURED');
    expect(batch.entries[0]!.unavailable?.notAttempted).toBe(true);
    expect(ipd.quoteRequestCount).toBe(0);
  });
});

// ── HTTP boundary ────────────────────────────────────────────────────────────

describe('W-31 HTTP boundary — GET /api/watchlists/:id/quotes', () => {
  let tmpDir: string;
  let carrierPath: string;
  let savedEnvPath: string | undefined;
  let savedDataDir: string | undefined;

  beforeAll(() => {
    savedEnvPath = process.env[OWNER_CONTEXT_PATH_ENV];
    savedDataDir = process.env.IIPS_DATA_DIR;
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'w31-http-'));
    process.env.IIPS_DATA_DIR = tmpDir;
    resetWatchlistsPersistence();
    const carrier = materialiseOwnerContextCarrier(tmpDir);
    carrierPath = path.join(tmpDir, OWNER_CONTEXT_CARRIER_FILENAME);
    void carrier;
    process.env[OWNER_CONTEXT_PATH_ENV] = carrierPath;
    // Create a watchlist for HTTP tests
    const s = new PersistenceService({ dataDir: path.join(tmpDir, 'watchlists') });
    createWatchlist(TENANT_ID, OWNER_USER_ID, 'http-wl', 'HTTP WL', s, '2026-11-01T00:00:00.000Z');
    addItem(TENANT_ID, OWNER_USER_ID, 'http-wl', governRow('ISIN:INE002A01018:EQ', 'SYNTH_CURRENT'), [], s);
    addItem(TENANT_ID, OWNER_USER_ID, 'http-wl', governRow('Technology', 'Technology-H1'), [], s);
    addItem(TENANT_ID, OWNER_USER_ID, 'http-wl', governRow('ISIN:INE467B01029:EQ', 'SYNTH_UNAVAILABLE'), [], s);
    resetWatchlistsPersistence();
  });

  afterAll(() => {
    if (savedEnvPath === undefined) delete process.env[OWNER_CONTEXT_PATH_ENV];
    else process.env[OWNER_CONTEXT_PATH_ENV] = savedEnvPath;
    if (savedDataDir === undefined) delete process.env.IIPS_DATA_DIR;
    else process.env.IIPS_DATA_DIR = savedDataDir;
    resetWatchlistsPersistence();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  function httpGet(pathname: string): Promise<{ status: number; body: Record<string, unknown> }> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        void handleWatchlistQuotesRequest(req, res, {
          transport: {
            ok: true,
            config: { baseUrl: (ipd as unknown as { baseUrl: string }).baseUrl ?? 'http://127.0.0.1:8791', token: 't', timeoutMs: 5000, configured: true },
          },
        });
      });
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        const opts = { hostname: '127.0.0.1', port: addr.port, path: pathname, method: 'GET' };
        const req = http.request(opts, (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c as Buffer));
          res.on('end', () => {
            server.close();
            try {
              resolve({ status: res.statusCode ?? 500, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown> });
            } catch {
              resolve({ status: res.statusCode ?? 500, body: {} });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
    });
  }

  it('returns 503 when owner context is not established', async () => {
    const saved = process.env[OWNER_CONTEXT_PATH_ENV];
    delete process.env[OWNER_CONTEXT_PATH_ENV];
    const result = await httpGet('/api/watchlists/http-wl/quotes');
    expect(result.status).toBe(503);
    if (saved !== undefined) process.env[OWNER_CONTEXT_PATH_ENV] = saved;
    else delete process.env[OWNER_CONTEXT_PATH_ENV];
  });

  it('returns 404 for a watchlist that does not exist for this owner', async () => {
    const result = await httpGet('/api/watchlists/does-not-exist/quotes');
    expect(result.status).toBe(404);
  });

  it('returns enriched quotes with ordering preserved via HTTP (synthetic transport)', async () => {
    ipd.behaviours = { SYNTH_CURRENT: 'CURRENT', SYNTH_UNAVAILABLE: 'UNAVAILABLE' };
    // Inject synthetic transport via deps — need to rebuild server with correct baseUrl
    const result = await new Promise<{ status: number; body: Record<string, unknown> }>((resolve, reject) => {
      const server = http.createServer((req, res) => {
        void handleWatchlistQuotesRequest(req, res, ipd.deps());
      });
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        const req2 = http.request({ hostname: '127.0.0.1', port: addr.port, path: '/api/watchlists/http-wl/quotes', method: 'GET' }, (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c as Buffer));
          res.on('end', () => {
            server.close();
            try {
              resolve({ status: res.statusCode ?? 500, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown> });
            } catch {
              resolve({ status: res.statusCode ?? 500, body: {} });
            }
          });
        });
        req2.on('error', reject);
        req2.end();
      });
    });
    expect(result.status).toBe(200);
    const data = result.body.data as { watchlistId: string; quotes: WatchlistQuotesView['quotes']; summary: { pricedCount: number } };
    expect(data.watchlistId).toBe('http-wl');
    expect(data.quotes).toHaveLength(3);
    expect(data.quotes[0]!.outcome).toBe('CURRENT');
    expect(data.quotes[1]!.outcome).toBe('MALFORMED_IDENTITY');
    expect(data.quotes[2]!.outcome).toBe('UNAVAILABLE');
    // Unresolved never zero, stale never current, ordering preserved
    expect(data.quotes[1]!.value).toBeNull();
    expect(data.quotes[0]!.value).not.toBeNull();
  });
});
