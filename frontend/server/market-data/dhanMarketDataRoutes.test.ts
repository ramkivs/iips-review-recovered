/**
 * DHAN-P3 — quote and historical route tests.
 *
 * These qualify the IRR-owned boundary end to end: the browser-facing request, the
 * server-side transport to IPD, the projection of IPD's canonical envelopes onto IRR's
 * presentation vocabulary, and the failure semantics.
 *
 * A synthetic IPD transport is used. It serves IPD's OWN routes, request contracts and
 * response envelopes, and every scenario is named so the synthetic nature is explicit. No
 * Dhan credential is read, no vendor endpoint is contacted and no live data is involved.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  DHAN_HISTORICAL_PATH,
  DHAN_MAX_HISTORICAL_WINDOW_DAYS,
  DHAN_QUOTES_PATH,
  handleDhanHistoricalRequest,
  handleDhanQuotesRequest,
  mapIpdFailureToHttpStatus,
  mapIpdFreshnessToIrrFreshness,
  projectIpdHistoricalResult,
  projectIpdQuoteEnvelope,
  validateDhanHistoricalRequest,
  validateDhanQuoteRequest,
  type DhanMarketDataRouteDeps,
} from './dhanMarketDataRoutes';
import {
  syntheticBehaviourFor,
  syntheticHistoricalResult,
  syntheticQuoteEnvelope,
  type SyntheticScenario,
} from './dhanSyntheticFixtures';

/**
 * A synthetic IPD market-data transport.
 *
 * It serves the SAME routes and response envelopes as IPD's `createMarketDataHttpServer`,
 * so the IRR boundary is exercised against the real contract shape. It is a TEST FIXTURE:
 * every number it returns is a fixed literal and nothing it produces was observed from the
 * vendor.
 */
class SyntheticIpdTransport {
  private server: http.Server | null = null;
  private scenario: SyntheticScenario = 'QUOTE_SUCCESS';
  private baseUrl = '';

  public setScenario(scenario: SyntheticScenario): void {
    this.scenario = scenario;
  }

  public async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      const behaviour = syntheticBehaviourFor(this.scenario);

      if (behaviour.kind === 'HANG') {
        // Never answer: the client's timeout must fire.
        return;
      }
      if (behaviour.kind === 'CLOSE') {
        // Destroy the socket: the connection must fail.
        req.socket.destroy();
        return;
      }

      const body = JSON.stringify(behaviour.body ?? {});
      res.writeHead(behaviour.status ?? 200, {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      });
      res.end(body);
    });
    await new Promise<void>((resolve) => this.server!.listen(0, '127.0.0.1', resolve));
    const address = this.server!.address() as AddressInfo;
    this.baseUrl = `http://127.0.0.1:${address.port}`;
  }

  public async stop(): Promise<void> {
    if (this.server === null) return;
    await new Promise<void>((resolve) => this.server!.close(() => resolve()));
    this.server = null;
  }

  public deps(): DhanMarketDataRouteDeps {
    return {
      transport: {
        ok: true,
        config: {
          baseUrl: this.baseUrl,
          token: 'synthetic-transport-token',
          timeoutMs: 2000,
          configured: true,
        },
      },
    };
  }
}

const transport = new SyntheticIpdTransport();

beforeAll(async () => {
  await transport.start();
});

afterAll(async () => {
  await transport.stop();
});

/** Calls the quote route against the synthetic transport. */
async function callQuotes(
  body: unknown,
  scenario?: SyntheticScenario,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (scenario !== undefined) transport.setScenario(scenario);
  const server = http.createServer((req, res) => {
    void handleDhanQuotesRequest(req, res, transport.deps());
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${DHAN_QUOTES_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

/** Calls the historical route against the synthetic transport. */
async function callHistorical(
  body: unknown,
  scenario?: SyntheticScenario,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (scenario !== undefined) transport.setScenario(scenario);
  const server = http.createServer((req, res) => {
    void handleDhanHistoricalRequest(req, res, transport.deps());
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${DHAN_HISTORICAL_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const VALID_QUOTE = {
  companyId: 'SYNTHETIC:COMPANY',
  securityId: 'ISIN:INE002A01018:EQ',
};

const VALID_HISTORICAL = {
  companyId: 'SYNTHETIC:COMPANY',
  interval: '1D',
  fromDate: '2026-10-01',
  toDate: '2026-10-31',
};

describe('DHAN-P3 quote route', () => {
  it('returns a canonical quote with its freshness and provenance', async () => {
    const response = await callQuotes(VALID_QUOTE, 'QUOTE_SUCCESS');
    expect(response.status).toBe(200);

    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.freshness).toBe('SNAPSHOT');
    expect(data.qualityState).toBe('GOOD');
    expect(data.asOf).toBe('2026-11-06T10:15:00.000Z');
    expect(data.receivedAt).toBe('2026-11-06T10:15:00.120Z');
    expect(data.evaluatedAt).toBe('2026-11-06T10:15:00.121Z');
    expect(data.securityId).toBe('ISIN:INE002A01018:EQ');

    const quote = data.quote as Record<string, unknown>;
    expect(quote.ltp).toBe(100.6);
    expect(quote.symbol).toBe('SYNTH');

    const provenance = data.provenance as Record<string, unknown>;
    expect(provenance.sourceClassification).toBe('CANONICAL_MARKET_DATA');
    expect(provenance.dataVersion).toBe('synthetic-fixture-v1');
  });

  it('never reports a quote as LIVE', async () => {
    const response = await callQuotes(VALID_QUOTE, 'QUOTE_SUCCESS');
    const data = (response.body as { data: Record<string, unknown> }).data;
    // IPD's `CURRENT` maps to IRR `SNAPSHOT`, never `LIVE`.
    expect(data.freshness).not.toBe('LIVE');
  });

  it('reports a STALE quote as STALE, never as current', async () => {
    const response = await callQuotes(VALID_QUOTE, 'QUOTE_STALE');
    expect(response.status).toBe(200);
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.freshness).toBe('STALE');
    expect(data.qualityState).toBe('STALE');
    expect(data.freshness).not.toBe('SNAPSHOT');
    expect(data.freshness).not.toBe('LIVE');
  });

  it('reports an UNAVAILABLE quality verdict as UNAVAILABLE', async () => {
    const response = await callQuotes(VALID_QUOTE, 'QUOTE_UNAVAILABLE');
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.freshness).toBe('UNAVAILABLE');
  });

  it('rejects a request with no canonical identity before contacting the transport', async () => {
    const response = await callQuotes({ companyId: 'SYNTHETIC:COMPANY' }, 'QUOTE_SUCCESS');
    expect(response.status).toBe(400);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('MISSING_REQUIRED_FIELD');
    // The failure is an IDENTITY failure, distinct from unavailable market data.
    expect(error.identityFailure).toBe(true);
    expect(error.connectionAttempted).toBe(false);
  });

  it('rejects a malformed canonical identity', async () => {
    const response = await callQuotes(
      { companyId: 'SYNTHETIC:COMPANY', securityId: 'NOT-AN-IDENTITY' },
      'QUOTE_SUCCESS',
    );
    expect(response.status).toBe(400);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('MALFORMED_REQUEST');
    expect(error.identityFailure).toBe(true);
  });

  it('preserves the distinction between an unresolved identity and unavailable data', async () => {
    const response = await callQuotes(VALID_QUOTE, 'IDENTITY_UNRESOLVED');
    expect(response.status).toBe(502);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('UNRESOLVED_INSTRUMENT');
    expect(error.identityFailure).toBe(true);
    expect(error.connectionAttempted).toBe(true);
  });

  it('reports a transport authentication failure distinctly', async () => {
    const response = await callQuotes(VALID_QUOTE, 'TRANSPORT_UNAUTHENTICATED');
    expect(response.status).toBe(401);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('UNAUTHENTICATED');
    expect(error.identityFailure).toBe(false);
  });

  it('reports an unreachable transport as a transport failure, not as an identity failure', async () => {
    const response = await callQuotes(VALID_QUOTE, 'TRANSPORT_UNAVAILABLE');
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('TRANSPORT_FAILURE');
    expect(error.identityFailure).toBe(false);
    expect(error.connectionAttempted).toBe(true);
  });

  it('reports a rate limit distinctly', async () => {
    const response = await callQuotes(VALID_QUOTE, 'RATE_LIMITED');
    expect(response.status).toBe(429);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('RATE_LIMITED');
  });

  it('reports a transport timeout distinctly', async () => {
    const response = await callQuotes(VALID_QUOTE, 'TRANSPORT_TIMEOUT');
    expect(response.status).toBe(504);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('TIMEOUT');
    expect(error.identityFailure).toBe(false);
    // The connection WAS attempted; it simply did not answer in time.
    expect(error.connectionAttempted).toBe(true);
  });

  it('answers 503 when the transport is not configured at all', async () => {
    const server = http.createServer((req, res) => {
      void handleDhanQuotesRequest(req, res, { env: {} });
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}${DHAN_QUOTES_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(VALID_QUOTE),
      });
      expect(response.status).toBe(503);
      const error = (await response.json()) as { error: Record<string, unknown> };
      expect(error.error.code).toBe('NOT_CONFIGURED');
      expect(error.error.connectionAttempted).toBe(false);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('never publishes the transport token or a credential in a response', async () => {
    const response = await callQuotes(VALID_QUOTE, 'QUOTE_SUCCESS');
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain('synthetic-transport-token');
    expect(serialized).not.toContain('IIPS_MARKET_DATA_TRANSPORT_TOKEN');
    expect(serialized).not.toMatch(/Bearer\s/);
  });
});

describe('DHAN-P3 historical route', () => {
  it('returns canonical candles with the requested range and coverage claim', async () => {
    const response = await callHistorical(VALID_HISTORICAL, 'HISTORICAL_SUCCESS');
    expect(response.status).toBe(200);

    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.requestedFromDate).toBe('2026-11-01');
    expect(data.requestedToDate).toBe('2026-11-03');
    expect(data.returnedCandleCount).toBe(3);
    expect(data.coverageClaim).toBe('ACCESS_PENDING_UNVERIFIED');

    const candles = data.candles as Record<string, unknown>[];
    expect(candles).toHaveLength(3);
    expect(candles[0]!.open).toBe(100);
    expect(candles[0]!.close).toBe(100.5);
  });

  it('reports an empty series as an explicit empty result', async () => {
    const response = await callHistorical(VALID_HISTORICAL, 'HISTORICAL_EMPTY');
    expect(response.status).toBe(200);
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.returnedCandleCount).toBe(0);
    expect(data.candles).toEqual([]);
  });

  it('rejects an unsupported interval before contacting the transport', async () => {
    const response = await callHistorical(
      { ...VALID_HISTORICAL, interval: '7m' },
      'HISTORICAL_SUCCESS',
    );
    expect(response.status).toBe(400);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('UNSUPPORTED_INTERVAL');
    expect(error.identityFailure).toBe(true);
    expect(error.connectionAttempted).toBe(false);
  });

  it('rejects an inverted date range', async () => {
    const response = await callHistorical(
      { ...VALID_HISTORICAL, fromDate: '2026-10-31', toDate: '2026-10-01' },
      'HISTORICAL_SUCCESS',
    );
    expect(response.status).toBe(400);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('INVALID_DATE_RANGE');
  });

  it('rejects a window longer than the maximum', async () => {
    const response = await callHistorical(
      { ...VALID_HISTORICAL, fromDate: '2020-01-01', toDate: '2026-10-31' },
      'HISTORICAL_SUCCESS',
    );
    expect(response.status).toBe(400);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('INVALID_DATE_RANGE');
    expect(String(error.message)).toContain(String(DHAN_MAX_HISTORICAL_WINDOW_DAYS));
  });

  it('accepts a window of exactly the maximum number of days (inclusive semantics)', () => {
    // 1825 inclusive days from 2021-01-01 is 2025-12-30: 2024 is a leap year, so the naive
    // calendar answer is off by one. The bound is computed exactly as IPD computes it.
    const validation = validateDhanHistoricalRequest({
      companyId: 'SYNTHETIC:COMPANY',
      interval: '1D',
      fromDate: '2021-01-01',
      toDate: '2025-12-30',
    });
    expect(validation.ok).toBe(true);
  });

  it('rejects a window of one day beyond the maximum', () => {
    const validation = validateDhanHistoricalRequest({
      companyId: 'SYNTHETIC:COMPANY',
      interval: '1D',
      fromDate: '2021-01-01',
      toDate: '2025-12-31',
    });
    expect(validation.ok).toBe(false);
    expect(validation.code).toBe('INVALID_DATE_RANGE');
  });

  it('accepts a single-day range (both ends inclusive)', () => {
    const validation = validateDhanHistoricalRequest({
      companyId: 'SYNTHETIC:COMPANY',
      interval: '1D',
      fromDate: '2026-10-01',
      toDate: '2026-10-01',
    });
    expect(validation.ok).toBe(true);
  });

  it('preserves every supported interval', () => {
    for (const interval of ['1m', '5m', '15m', '1h', '1D']) {
      const validation = validateDhanHistoricalRequest({
        ...VALID_HISTORICAL,
        interval,
      });
      expect(validation.ok, `expected ${interval} to be accepted`).toBe(true);
    }
  });

  it('reports a transport failure distinctly', async () => {
    const response = await callHistorical(VALID_HISTORICAL, 'TRANSPORT_UNAVAILABLE');
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('TRANSPORT_FAILURE');
    expect(error.identityFailure).toBe(false);
  });
});

describe('DHAN-P3 freshness mapping', () => {
  it('maps IPD CURRENT to IRR SNAPSHOT, never to LIVE', () => {
    expect(mapIpdFreshnessToIrrFreshness('GOOD', 'CURRENT')).toBe('SNAPSHOT');
  });

  it('maps IPD STALE to IRR STALE', () => {
    expect(mapIpdFreshnessToIrrFreshness('STALE', 'STALE')).toBe('STALE');
    expect(mapIpdFreshnessToIrrFreshness('STALE', undefined)).toBe('STALE');
  });

  it('maps IPD UNAVAILABLE to IRR UNAVAILABLE', () => {
    expect(mapIpdFreshnessToIrrFreshness('UNAVAILABLE', undefined)).toBe('UNAVAILABLE');
  });

  it('never produces LIVE for any input', () => {
    for (const quality of ['GOOD', 'STALE', 'UNAVAILABLE', 'PARTIAL', 'UNKNOWN', undefined]) {
      for (const marker of ['CURRENT', 'STALE', undefined] as const) {
        expect(mapIpdFreshnessToIrrFreshness(quality, marker)).not.toBe('LIVE');
      }
    }
  });

  it('treats an unknown or missing quality verdict as unavailable, never as current', () => {
    expect(mapIpdFreshnessToIrrFreshness('SOMETHING_ELSE', 'CURRENT')).toBe('UNAVAILABLE');
    expect(mapIpdFreshnessToIrrFreshness(undefined, undefined)).toBe('UNAVAILABLE');
    expect(mapIpdFreshnessToIrrFreshness('PARTIAL', undefined)).toBe('UNAVAILABLE');
  });

  it('prefers the STALE transport marker over a GOOD quality state', () => {
    // A contradictory payload must not be presented as current.
    expect(mapIpdFreshnessToIrrFreshness('GOOD', 'STALE')).toBe('STALE');
  });
});

describe('DHAN-P3 envelope projection', () => {
  it('projects a canonical envelope without inventing fields', () => {
    const view = projectIpdQuoteEnvelope(syntheticQuoteEnvelope({ qualityState: 'GOOD' }), 'CURRENT');
    expect(view.quote?.ltp).toBe(100.6);
    expect(view.freshness).toBe('SNAPSHOT');
    expect(view.asOf).toBe('2026-11-06T10:15:00.000Z');
  });

  it('projects a missing payload as unavailable rather than as zeroes', () => {
    const view = projectIpdQuoteEnvelope({}, undefined);
    expect(view.freshness).toBe('UNAVAILABLE');
    expect(view.qualityState).toBe('UNAVAILABLE');
    expect(view.asOf).toBeNull();
    expect(view.quote?.ltp).toBe(0);
  });

  it('projects a historical result without recomputing it', () => {
    const view = projectIpdHistoricalResult(syntheticHistoricalResult({ candleCount: 2 }));
    expect(view.candles).toHaveLength(2);
    expect(view.returnedCandleCount).toBe(2);
    expect(view.coverageClaim).toBe('ACCESS_PENDING_UNVERIFIED');
    // A historical series carries no per-series quality verdict, so IRR does not invent one.
    expect(view.freshness).toBe('SNAPSHOT');
    expect(view.freshness).not.toBe('LIVE');
  });

  it('publishes the provider qualification on both views and never a live one', () => {
    const quoteView = projectIpdQuoteEnvelope(syntheticQuoteEnvelope({ qualityState: 'GOOD' }), 'CURRENT');
    const historicalView = projectIpdHistoricalResult(syntheticHistoricalResult());

    // A successful quote is NOT evidence of live provider connectivity. The qualification is
    // published alongside the data so a consumer cannot read one as the other.
    expect(quoteView.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    expect(historicalView.providerQualification).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
  });
});

describe('DHAN-P3 failure-code mapping', () => {
  it('preserves IPD own status semantics', () => {
    expect(mapIpdFailureToHttpStatus('MALFORMED_REQUEST')).toBe(400);
    expect(mapIpdFailureToHttpStatus('MISSING_REQUIRED_FIELD')).toBe(400);
    expect(mapIpdFailureToHttpStatus('INVALID_DATE_RANGE')).toBe(400);
    expect(mapIpdFailureToHttpStatus('UNSUPPORTED_INTERVAL')).toBe(400);
    expect(mapIpdFailureToHttpStatus('UNAUTHENTICATED')).toBe(401);
    expect(mapIpdFailureToHttpStatus('RATE_LIMITED')).toBe(429);
    expect(mapIpdFailureToHttpStatus('REQUEST_TIMEOUT')).toBe(504);
    expect(mapIpdFailureToHttpStatus('TIMEOUT')).toBe(504);
    expect(mapIpdFailureToHttpStatus('UNRESOLVED_INSTRUMENT')).toBe(502);
    expect(mapIpdFailureToHttpStatus('TRANSPORT_FAILURE')).toBe(502);
    expect(mapIpdFailureToHttpStatus('STALE_DATA_SUPPRESSED')).toBe(502);
  });
});

describe('DHAN-P3 request validation', () => {
  it('requires a company id', () => {
    expect(validateDhanQuoteRequest({ securityId: 'ISIN:INE002A01018:EQ' }).ok).toBe(false);
    expect(validateDhanHistoricalRequest({ interval: '1D', fromDate: '2026-01-01', toDate: '2026-01-02' }).ok).toBe(false);
  });

  it('requires a canonical quote identity', () => {
    const validation = validateDhanQuoteRequest({ companyId: 'C' });
    expect(validation.ok).toBe(false);
    expect(validation.code).toBe('MISSING_REQUIRED_FIELD');
  });

  it('accepts a well-formed canonical identity', () => {
    const validation = validateDhanQuoteRequest({
      companyId: 'C',
      securityId: 'ISIN:INE002A01018:EQ',
      exchangeSegment: 'NSE_EQ',
    });
    expect(validation.ok).toBe(true);
    expect(validation.securityId).toBe('ISIN:INE002A01018:EQ');
    expect(validation.exchangeSegment).toBe('NSE_EQ');
  });

  it('rejects a non-ISO date', () => {
    const validation = validateDhanHistoricalRequest({
      ...VALID_HISTORICAL,
      fromDate: '01-10-2026',
    });
    expect(validation.ok).toBe(false);
    expect(validation.code).toBe('INVALID_DATE_RANGE');
  });

  it('rejects a malformed ISIN', () => {
    const validation = validateDhanHistoricalRequest({
      ...VALID_HISTORICAL,
      isin: 'TOOLONGISINVALUE',
    });
    expect(validation.ok).toBe(false);
    expect(validation.code).toBe('MALFORMED_REQUEST');
  });

  it('accepts a well-formed ISIN', () => {
    const validation = validateDhanHistoricalRequest({
      ...VALID_HISTORICAL,
      isin: 'INE002A01018',
    });
    expect(validation.ok).toBe(true);
    expect(validation.isin).toBe('INE002A01018');
  });
});
