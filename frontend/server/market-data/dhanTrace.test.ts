/**
 * W-24 — joined IRR → IPD → D01 synthetic evidence.
 *
 * The synthetic daemon below uses IPD's OWN published `DhanDiagnosticRing` and
 * `validateTraceHeaders`, and returns D01 envelopes carrying `traceId`/`correlationId`.
 * IRR reaches it through IPD's own `MarketDataTransportClient`, so one action id is proved
 * across the real transport, both rings and the D01 provenance — not re-implemented in a
 * test-only fake of the client.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type httpTypes from 'node:http';
import {
  DhanDiagnosticRing,
  MARKET_DATA_ROUTES,
  TRACE_HEADER_ACTION,
  TRACE_HEADER_VERSION,
  TRACE_VERSION_VALUE,
  W24_EVENT_SCHEMA_VERSION,
  W24_RING_CAPACITY_IPD,
  W24_TRACE_CONTRACT_VERSION,
  generateTraceId,
  validateTraceHeaders,
} from 'iips-production-market-data/dhan-server';
import {
  clearIrrDiagnosticRingForTest,
  correlateIrrAction,
  createIrrActionContext,
  buildIrrTraceHeaders,
  IRR_W24_CONTRACT,
  IRR_W24_FAILURE_CATEGORIES,
  isIrrActionContext,
  readIrrTraceRing,
  recordIrrEvent,
  validateIrrDiagnosticEvent,
  type IrrActionTrace,
  type IrrW24Event,
  type IrrW24EventInput,
} from './dhanTrace';
import { consumeQuotes } from './quoteConsumptionBoundary';
import { DHAN_TRACE_PATH, handleDhanTraceRequest } from './dhanMarketDataRoutes';
import { projectWatchlistQuotesView } from '../watchlists/watchlists-quotes';
import { syntheticFreshnessStatus, syntheticQuoteEnvelope } from './dhanSyntheticFixtures';

const TOKEN = 'w24-synthetic-bearer';
const VALID_IDENTITY = {
  companyId: 'ISIN:INE002A01018',
  securityId: 'ISIN:INE002A01018:EQ',
  exchangeSegment: 'NSE_EQ',
};

type Scenario = 'SUCCESS' | 'CACHE_HIT' | 'COALESCED' | 'FAILURE';

interface StartedDaemon {
  readonly baseUrl: string;
  readonly close: () => Promise<void>;
  readonly quoteHeaders: { readonly version: string | undefined; readonly action: string | undefined }[];
  readonly quoteActions: string[];
  readonly freshnessHeaders: { readonly version: string | undefined; readonly action: string | undefined }[];
  readonly ipdRing: DhanDiagnosticRing;
  readonly sharedWorkId: string;
}

function ipdEvent(
  actionId: string,
  workId: string,
  attemptId: string,
  event: IrrW24Event['event'],
  outcome: IrrW24Event['outcome'],
  failureCategory: IrrW24Event['failureCategory'] = null,
): IrrW24EventInput & { readonly sequence: number } {
  return {
    schemaVersion: W24_EVENT_SCHEMA_VERSION,
    timestampUtc: new Date().toISOString(),
    component: 'IPD' as const,
    operation: 'QUOTE' as const,
    event,
    actionId,
    workId,
    attemptId,
    outcome,
    failureCategory,
    durationMs: 2,
    sequence: 0,
  };
}

/** Starts a loopback daemon that speaks IPD's W-24 wire contract with IPD's own ring/validator. */
async function startDaemon(scenario: Scenario): Promise<StartedDaemon> {
  const quoteHeaders: StartedDaemon['quoteHeaders'] = [];
  const quoteActions: StartedDaemon['quoteActions'] = [];
  const freshnessHeaders: StartedDaemon['freshnessHeaders'] = [];
  const ipdRing = new DhanDiagnosticRing(W24_RING_CAPACITY_IPD);
  const sharedWorkId = generateTraceId();
  const cacheProducerActionId = generateTraceId();
  let coalescedProducerActionId: string | null = null;

  const server = http.createServer((req, res) => {
    const path = (req.url ?? '').split('?')[0];
    res.setHeader('content-type', 'application/json');
    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'synthetic bearer required' } }));
      return;
    }

    if (path === MARKET_DATA_ROUTES.traceRing && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        ok: true,
        contractVersion: W24_TRACE_CONTRACT_VERSION,
        events: ipdRing.list(),
        stats: ipdRing.getStats(),
        schemaVersion: 1,
      }));
      return;
    }

    if (path === MARKET_DATA_ROUTES.freshness && req.method === 'GET') {
      const validated = validateTraceHeaders(req.headers);
      if (!validated.ok) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: { code: 'CONTRACT_MISMATCH', message: 'trace headers refused' } }));
        return;
      }
      freshnessHeaders.push({
        version: headerValue(req.headers[TRACE_HEADER_VERSION.toLowerCase()]),
        action: headerValue(req.headers[TRACE_HEADER_ACTION.toLowerCase()]),
      });
      res.writeHead(200);
      res.end(JSON.stringify(syntheticFreshnessStatus({ cacheState: 'CURRENT', verdict: 'GOOD', ageSeconds: 10 })));
      return;
    }

    if (path === MARKET_DATA_ROUTES.quotes && req.method === 'POST') {
      const validated = validateTraceHeaders(req.headers);
      if (!validated.ok) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: { code: 'CONTRACT_MISMATCH', message: 'trace headers refused' } }));
        return;
      }
      const actionId = validated.context.actionId;
      quoteActions.push(actionId);
      quoteHeaders.push({
        version: headerValue(req.headers[TRACE_HEADER_VERSION.toLowerCase()]),
        action: headerValue(req.headers[TRACE_HEADER_ACTION.toLowerCase()]),
      });
      const workId = sharedWorkId;
      const attemptId = generateTraceId();

      if (scenario === 'FAILURE') {
        ipdRing.record(ipdEvent(actionId, workId, attemptId, 'REQUEST_ADMITTED', 'UNKNOWN'));
        ipdRing.record(ipdEvent(actionId, workId, attemptId, 'ATTEMPT_END', 'FAILURE', 'RATE_LIMITED'));
        res.writeHead(429);
        res.end(JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'synthetic provider budget exhausted' } }));
        return;
      }

      ipdRing.record(ipdEvent(actionId, workId, attemptId, 'REQUEST_ADMITTED', 'UNKNOWN'));
      ipdRing.record(ipdEvent(actionId, workId, attemptId, 'ATTEMPT_END', 'SUCCESS'));
      if (scenario === 'COALESCED') {
        // IPD's first action owns the shared work; later requesters join it without
        // replacing the original producer correlation.
        if (coalescedProducerActionId === null) {
          coalescedProducerActionId = actionId;
          ipdRing.record(ipdEvent(actionId, workId, attemptId, 'WORK_START', 'UNKNOWN'));
        } else {
          ipdRing.record(ipdEvent(actionId, workId, attemptId, 'WORK_JOIN', 'SUCCESS'));
        }
      }
      const correlationId =
        scenario === 'SUCCESS' ? actionId
          : scenario === 'COALESCED' ? coalescedProducerActionId!
            : cacheProducerActionId;
      const envelope = syntheticQuoteEnvelope({ qualityState: 'GOOD' });
      const provenance = envelope.provenance as Record<string, unknown>;
      provenance.traceId = actionId;
      provenance.correlationId = correlationId;
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, envelope, freshness: 'CURRENT' }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'unknown synthetic route' } }));
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    quoteHeaders,
    quoteActions,
    freshnessHeaders,
    ipdRing,
    sharedWorkId,
  };
}

function transportFor(daemon: StartedDaemon) {
  return {
    ok: true as const,
    config: { baseUrl: daemon.baseUrl, token: TOKEN, timeoutMs: 2000, configured: true as const },
  };
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function actionEvents(actionId: string): readonly IrrW24Event[] {
  return readIrrTraceRing().events.filter((event) => event.actionId === actionId);
}

function fakeResponse(): {
  readonly res: httpTypes.ServerResponse;
  readonly state: { status: number; body: string };
} {
  const state = { status: 0, body: '' };
  const res = {
    setHeader() {},
    writeHead(status: number) { state.status = status; },
    end(body?: string) { state.body = body ?? ''; },
  } as unknown as httpTypes.ServerResponse;
  return { res, state };
}

describe('W-24 — IRR trace contract and ring', () => {
  beforeEach(() => clearIrrDiagnosticRingForTest());

  it('mints lowercase UUIDv4 action ids from IPD’s published generator', () => {
    const context = createIrrActionContext();
    expect(isIrrActionContext(context)).toBe(true);
    expect(context.traceVersion).toBe(TRACE_VERSION_VALUE);
    expect(context.actionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(buildIrrTraceHeaders(context)).toEqual({
      [TRACE_HEADER_VERSION]: '1',
      [TRACE_HEADER_ACTION]: context.actionId,
    });
  });

  it('publishes the approved contract constants and 512-event IRR capacity', () => {
    expect(IRR_W24_CONTRACT.contractVersion).toBe(1);
    expect(IRR_W24_CONTRACT.eventSchemaVersion).toBe(1);
    expect(IRR_W24_CONTRACT.irrRingCapacity).toBe(512);
    expect(IRR_W24_CONTRACT.ipdRingCapacity).toBe(1024);
    expect(IRR_W24_CONTRACT.maxEventBytes).toBe(1024);
    expect(IRR_W24_FAILURE_CATEGORIES).toHaveLength(13);
  });

  it('evicts oldest events, keeps sequence monotonic and reports bounded stats', () => {
    const actionId = createIrrActionContext().actionId;
    for (let index = 0; index < 515; index += 1) {
      expect(recordIrrEvent({
        operation: 'QUOTE',
        event: 'ACTION_START',
        actionId,
        outcome: 'UNKNOWN',
        durationMs: index,
      })).not.toBeNull();
    }
    const snapshot = readIrrTraceRing();
    expect(snapshot.stats.capacity).toBe(512);
    expect(snapshot.stats.size).toBe(512);
    expect(snapshot.stats.evictedCount).toBe(3);
    expect(snapshot.events).toHaveLength(512);
    expect(snapshot.events[0]?.sequence).toBe(3);
    expect(snapshot.events[snapshot.events.length - 1]?.sequence).toBe(514);
    expect(snapshot.events.every((event, index, all) => index === 0 || event.sequence > all[index - 1]!.sequence)).toBe(true);
  });

  it('maps unknown raw codes to the closed failure enum and validates the 1 KiB ceiling', () => {
    const actionId = createIrrActionContext().actionId;
    recordIrrEvent({
      operation: 'QUOTE',
      event: 'ACTION_END',
      actionId,
      outcome: 'FAILURE',
      failureCategory: 'A_CODE_THAT_IS_NOT_IN_THE_ENUM',
      durationMs: 1,
    });
    const category = actionEvents(actionId)[0]?.failureCategory;
    expect(category).toBe('INTERNAL_ERROR');
    expect(IRR_W24_FAILURE_CATEGORIES).toContain(category);

    const base = {
      schemaVersion: 1,
      timestampUtc: new Date().toISOString(),
      component: 'IRR',
      operation: 'QUOTE',
      event: 'ACTION_START',
      actionId,
      workId: actionId,
      attemptId: actionId,
      outcome: 'SUCCESS',
      failureCategory: null,
      durationMs: 0,
      sequence: 0,
    };
    expect(validateIrrDiagnosticEvent(base)).not.toBeNull();
    expect(validateIrrDiagnosticEvent({ ...base, prohibitedExtra: 'x'.repeat(2048) })).toBeNull();
  });

  it('correlates current, cache-hit and coalesced D01 identities without inventing a producer', () => {
    const actionId = createIrrActionContext().actionId;
    const producer = generateTraceId();
    const workId = generateTraceId();
    const attemptId = generateTraceId();
    const events = [
      validateIrrDiagnosticEvent(ipdEvent(actionId, workId, attemptId, 'WORK_START', 'SUCCESS'))!,
    ];

    const fresh = correlateIrrAction({ actionId, d01TraceId: actionId, d01CorrelationId: actionId, ipdEvents: events });
    expect(fresh.d01TraceId).toBe(actionId);
    expect(fresh.d01CorrelationId).toBe(actionId);
    expect(fresh.identifierConsistent).toBe(true);

    const cacheHit = correlateIrrAction({ actionId, d01TraceId: actionId, d01CorrelationId: producer, ipdEvents: events });
    expect(cacheHit.d01TraceId).toBe(actionId);
    expect(cacheHit.d01CorrelationId).toBe(producer);
    expect(cacheHit.ipdWorkIds).toEqual([workId]);

    const otherAction = generateTraceId();
    const coalesced = correlateIrrAction({
      actionId,
      d01TraceId: actionId,
      d01CorrelationId: producer,
      ipdEvents: [
        ...events,
        validateIrrDiagnosticEvent(ipdEvent(otherAction, workId, generateTraceId(), 'WORK_JOIN', 'SUCCESS'))!,
      ],
    });
    expect(coalesced.ipdWorkIds).toEqual([workId]);
    expect(coalesced.ipdAttemptIds).toHaveLength(1);

    const mismatched: IrrActionTrace = correlateIrrAction({
      actionId,
      d01TraceId: generateTraceId(),
      d01CorrelationId: producer,
      ipdEvents: events,
    });
    expect(mismatched.identifierConsistent).toBe(false);
  });

  it('passes the same action id to the quote and supplementary freshness transport calls', async () => {
    const daemon = await startDaemon('SUCCESS');
    try {
      const context = createIrrActionContext();
      const batch = await consumeQuotes([VALID_IDENTITY], { transport: transportFor(daemon), traceContext: context });
      const entry = batch.entries[0]!;

      expect(batch.trace.actionId).toBe(context.actionId);
      expect(entry.provenance?.traceId).toBe(context.actionId);
      expect(entry.provenance?.correlationId).toBe(context.actionId);
      expect(batch.trace.identifierConsistent).toBe(true);
      expect(batch.trace.ipdWorkIds).toEqual([daemon.sharedWorkId]);
      expect(batch.trace.ipdAttemptIds).toHaveLength(1);
      expect(batch.trace.ringReadFailureCode).toBeNull();

      expect(daemon.quoteHeaders).toHaveLength(1);
      expect(daemon.quoteHeaders[0]).toEqual({ version: '1', action: context.actionId });
      expect(daemon.freshnessHeaders.length).toBeGreaterThan(0);
      expect(daemon.freshnessHeaders.every((headers) => headers.version === '1' && headers.action === context.actionId)).toBe(true);

      const local = actionEvents(context.actionId);
      expect(local.map((event) => event.event)).toContain('ACTION_START');
      expect(local.map((event) => event.event)).toContain('REQUEST_ADMITTED');
      expect(local.map((event) => event.event)).toContain('ACTION_END');
      expect(local.every((event) => event.component === 'IRR')).toBe(true);
      expect(daemon.ipdRing.list().every((event) => event.actionId === context.actionId)).toBe(true);
    } finally {
      await daemon.close();
    }
  });

  it('never projects W-24 action references into a browser watchlist view', async () => {
    const daemon = await startDaemon('SUCCESS');
    try {
      const context = createIrrActionContext();
      const batch = await consumeQuotes([VALID_IDENTITY], {
        transport: transportFor(daemon),
        traceContext: context,
      });
      const view = projectWatchlistQuotesView(
        { watchlistId: 'w', name: 'n', createdAt: '2026-11-26T00:00:00.000Z', items: [] } as never,
        batch,
      );
      const serialized = JSON.stringify(view);
      expect(serialized).not.toContain(context.actionId);
      expect(serialized).not.toContain('"trace"');
      expect(serialized).not.toContain('traceId');
      expect(serialized).not.toContain('correlationId');
    } finally {
      await daemon.close();
    }
  });

  it('keeps the original producer action on a cache hit', async () => {
    const daemon = await startDaemon('CACHE_HIT');
    try {
      const context = createIrrActionContext();
      const entry = (await consumeQuotes([VALID_IDENTITY], {
        transport: transportFor(daemon),
        traceContext: context,
      })).entries[0]!;
      expect(entry.provenance?.traceId).toBe(context.actionId);
      expect(entry.provenance?.correlationId).not.toBe(context.actionId);
      expect(entry.trace.d01CorrelationId).toBe(entry.provenance?.correlationId);
      expect(entry.trace.identifierConsistent).toBe(true);
    } finally {
      await daemon.close();
    }
  });

  it('preserves each requester action id while two coalesced requests share one IPD work', async () => {
    const daemon = await startDaemon('COALESCED');
    try {
      const producer = createIrrActionContext();
      const joiner = createIrrActionContext();
      const first = (await consumeQuotes([VALID_IDENTITY], {
        transport: transportFor(daemon), traceContext: producer, joinFreshness: false,
      })).entries[0]!;
      const second = (await consumeQuotes([VALID_IDENTITY], {
        transport: transportFor(daemon), traceContext: joiner, joinFreshness: false,
      })).entries[0]!;

      expect(daemon.quoteActions).toEqual([producer.actionId, joiner.actionId]);
      expect(first.provenance?.traceId).toBe(producer.actionId);
      expect(second.provenance?.traceId).toBe(joiner.actionId);
      expect(first.provenance?.correlationId).toBe(producer.actionId);
      expect(second.provenance?.correlationId).toBe(producer.actionId);
      expect(first.trace.ipdWorkIds).toEqual([daemon.sharedWorkId]);
      expect(second.trace.ipdWorkIds).toEqual([daemon.sharedWorkId]);
      expect(first.trace.identifierConsistent).toBe(true);
      expect(second.trace.identifierConsistent).toBe(true);
      expect(actionEvents(producer.actionId).map((event) => event.event)).toContain('ACTION_START');
      expect(actionEvents(joiner.actionId).map((event) => event.event)).toContain('ACTION_START');
      const ipdActions = daemon.ipdRing.list().map((event) => event.actionId);
      expect(ipdActions).toContain(producer.actionId);
      expect(daemon.ipdRing.list().some((event) =>
        event.actionId === joiner.actionId && event.event === 'WORK_JOIN',
      )).toBe(true);
    } finally {
      await daemon.close();
    }
  });

  it('traces a failed operation with the IPD failure category and no invented D01 provenance', async () => {
    const daemon = await startDaemon('FAILURE');
    try {
      const context = createIrrActionContext();
      const entry = (await consumeQuotes([VALID_IDENTITY], {
        transport: transportFor(daemon),
        traceContext: context,
        joinFreshness: false,
      })).entries[0]!;
      expect(entry.outcome).toBe('UNAVAILABLE');
      expect(entry.unavailable?.code).toBe('RATE_LIMITED');
      expect(entry.provenance).toBeNull();
      expect(entry.trace.d01TraceId).toBeNull();
      expect(entry.trace.ipdFailureCategory).toBe('RATE_LIMITED');
      expect(entry.trace.identifierConsistent).toBe(true);
      const endEvent = actionEvents(context.actionId).find((event) => event.event === 'ACTION_END');
      expect(endEvent?.outcome).toBe('FAILURE');
      expect(endEvent?.failureCategory).toBe('RATE_LIMITED');
    } finally {
      await daemon.close();
    }
  });

  it('traces a pre-IPD configuration failure without inventing an IPD ring event', async () => {
    const batch = await consumeQuotes([VALID_IDENTITY], { env: {} });
    expect(batch.transportConfigured).toBe(false);
    expect(batch.trace.actionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4/);
    expect(batch.trace.ipdWorkIds).toEqual([]);
    const events = actionEvents(batch.trace.actionId);
    expect(events.map((event) => event.event)).toContain('ACTION_START');
    expect(events.find((event) => event.event === 'ACTION_END')?.outcome).toBe('FAILURE');
  });
});

describe('W-24 — server-only operator trace reader', () => {
  beforeEach(() => clearIrrDiagnosticRingForTest());

  it('refuses missing and wrong bearer, malformed queries, and non-loopback peers', async () => {
    const actionId = createIrrActionContext().actionId;
    const env = { IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN };
    const server = http.createServer((req, res) => { void handleDhanTraceRequest(req, res, { env }); });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    const base = `http://127.0.0.1:${port}${DHAN_TRACE_PATH}`;
    try {
      expect((await fetch(base)).status).toBe(401);
      const wrong = await fetch(base, { headers: { authorization: `Bearer not-${TOKEN}` } });
      expect(wrong.status).toBe(401);
      const badQuery = await fetch(`${base}?limit=not-a-number`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      expect(badQuery.status).toBe(400);

      const nonLoopback = fakeResponse();
      await handleDhanTraceRequest({
        url: DHAN_TRACE_PATH,
        method: 'GET',
        headers: { authorization: `Bearer ${TOKEN}` },
        socket: { remoteAddress: '203.0.113.5' },
      } as unknown as httpTypes.IncomingMessage, nonLoopback.res, { env });
      expect(nonLoopback.state.status).toBe(403);
      expect(actionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4/);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('serves IRR and IPD rings with one action id and discloses no credential or path', async () => {
    const daemon = await startDaemon('SUCCESS');
    const actionId = createIrrActionContext().actionId;
    const env = {
      IIPS_MARKET_DATA_TRANSPORT_TOKEN: TOKEN,
      IIPS_MARKET_DATA_BASE_URL: daemon.baseUrl,
    };
    const server = http.createServer((req, res) => { void handleDhanTraceRequest(req, res, { env }); });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      await consumeQuotes([VALID_IDENTITY], {
        transport: transportFor(daemon),
        traceContext: { traceVersion: TRACE_VERSION_VALUE, actionId },
        joinFreshness: false,
      });
      const response = await fetch(`http://127.0.0.1:${port}${DHAN_TRACE_PATH}?actionId=${actionId}&limit=64`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      expect(response.status).toBe(200);
      const body = await response.json() as {
        ok: boolean;
        contractVersion: number;
        irr: { events: IrrW24Event[] };
        ipd: { available: boolean; events: IrrW24Event[] };
        correlation: IrrActionTrace;
      };
      expect(body.ok).toBe(true);
      expect(body.contractVersion).toBe(1);
      expect(body.irr.events.length).toBeGreaterThan(0);
      expect(body.ipd.available).toBe(true);
      expect(body.ipd.events.every((event) => event.actionId === actionId)).toBe(true);
      expect(body.correlation.actionId).toBe(actionId);
      expect(body.correlation.identifierConsistent).toBe(true);

      const serialized = JSON.stringify(body);
      expect(serialized).not.toContain(TOKEN);
      expect(serialized).not.toContain(daemon.baseUrl);
      expect(serialized).not.toMatch(/vault:\/\//i);
      expect(serialized).not.toMatch(/[A-Z]:\\/);
      expect(serialized).not.toContain('/home/');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await daemon.close();
    }
  });
});
