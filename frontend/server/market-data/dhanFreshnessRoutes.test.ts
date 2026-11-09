/**
 * DHAN-P5 — freshness route tests.
 *
 * These qualify the IRR-owned freshness boundary end to end: the request validation, the
 * projection of IPD's authoritative status onto IRR's vocabulary, the D02 limitation, and
 * the failure semantics.
 *
 * A synthetic IPD transport is used. It serves IPD's OWN route, request contract and
 * response shape, and every scenario is named so the synthetic nature is explicit. No Dhan
 * credential is read, no vendor endpoint is contacted and no live data is involved.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  DHAN_FRESHNESS_PATH,
  handleDhanFreshnessRequest,
  mapIpdVerdictToIrrFreshness,
  parseFreshnessQuery,
  projectIpdFreshnessStatus,
  type DhanFreshnessRouteDeps,
} from './dhanFreshnessRoutes';
import {
  syntheticBehaviourForRoute,
  syntheticFreshnessStatus,
  type SyntheticRoute,
  type SyntheticScenario,
} from './dhanSyntheticFixtures';

/**
 * A synthetic IPD market-data transport that also serves IPD's read-only freshness route.
 *
 * It is a TEST FIXTURE: every number it returns is a fixed literal and nothing it produces
 * was observed from the vendor.
 */
class SyntheticIpdTransport {
  private server: http.Server | null = null;
  private scenario: SyntheticScenario = 'FRESHNESS_D01_CURRENT';
  private baseUrl = '';

  public setScenario(scenario: SyntheticScenario): void {
    this.scenario = scenario;
  }

  public async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      const url = req.url ?? '';
      const path = url.split('?')[0];
      const route: SyntheticRoute =
        path === '/v1/quotes' ? 'quotes' : path === '/v1/historical' ? 'historical' : 'freshness';
      const domain = new URL(url, 'http://localhost').searchParams.get('domain');
      const behaviour = syntheticBehaviourForRoute(
        this.scenario,
        route,
        domain === 'D02_OHLCV' ? 'D02_OHLCV' : 'D01_QUOTES',
      );

      if (behaviour.kind === 'HANG') return;
      if (behaviour.kind === 'CLOSE') {
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

  public deps(): DhanFreshnessRouteDeps {
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

/** Calls the freshness route against the synthetic transport. */
async function callFreshness(
  query: string,
  scenario?: SyntheticScenario,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (scenario !== undefined) transport.setScenario(scenario);
  const server = http.createServer((req, res) => {
    void handleDhanFreshnessRequest(req, res, transport.deps());
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const response = await fetch(`http://127.0.0.1:${port}${DHAN_FRESHNESS_PATH}${query}`, {
      method: 'GET',
    });
    return {
      status: response.status,
      body: (await response.json().catch(() => ({}))) as Record<string, unknown>,
    };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

const D01_QUERY =
  '?domain=D01_QUOTES&companyId=SYNTHETIC:COMPANY&exchangeSegment=NSE_EQ&securityId=ISIN:INE002A01018:EQ';

describe('DHAN-P5 freshness route', () => {
  it('returns the authoritative freshness status for a D01 quote scope', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_CURRENT');
    expect(response.status).toBe(200);

    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.domain).toBe('D01_QUOTES');
    expect(data.cacheState).toBe('CURRENT');
    expect(data.verdict).toBe('GOOD');
    // IPD `GOOD` maps to IRR `SNAPSHOT`, never `LIVE`.
    expect(data.freshness).toBe('SNAPSHOT');
    expect(data.freshness).not.toBe('LIVE');
    expect(data.thresholdSeconds).toBe(900);
    expect(data.ageSeconds).toBe(120);
    expect(data.timestampEvidence).toBe('VALID');
    expect(data.staleConcessionActive).toBe(false);
    expect(data.suppressExecution).toBe(false);
    expect(data.eligibleForUse).toBe(true);
    expect(data.evidenceAvailable).toBe(true);
    expect((data.lastRefresh as Record<string, unknown>).outcome).toBe('SUCCESS');
  });

  it('publishes the observation, receipt and evaluation timestamps separately', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_CURRENT');
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.asOf).toBe('2026-11-06T10:15:00.000Z');
    expect(data.receivedAt).toBe('2026-11-06T10:15:00.120Z');
    expect(data.evaluatedAt).toBe('2026-11-06T10:15:00.121Z');
    expect(data.observationEvaluatedAt).toBe('2026-11-06T10:15:00.121Z');
  });

  it('reports a stale concession explicitly', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_STALE');
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.freshness).toBe('STALE');
    expect(data.staleConcessionActive).toBe(true);
    expect(data.suppressExecution).toBe(false);
    expect(data.eligibleForUse).toBe(true);
    expect((data.lastRefresh as Record<string, unknown>).outcome).toBe('SKIPPED_FRESH');
  });

  it('reports suppression explicitly', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_SUPPRESSED');
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.freshness).toBe('UNAVAILABLE');
    expect(data.suppressExecution).toBe(true);
    expect(data.eligibleForUse).toBe(false);
    expect(data.staleConcessionActive).toBe(false);
  });

  it('reports sanitized refresh failure information', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_SUPPRESSED');
    const data = (response.body as { data: Record<string, unknown> }).data;
    const lastRefresh = data.lastRefresh as Record<string, unknown>;
    expect(lastRefresh.outcome).toBe('FAILURE');
    expect(lastRefresh.lastFailure).toEqual({ code: 'REFRESH_FAILED', priorPreserved: true });
    // The failure carries no provider message, no provider code and no secret reference.
    expect(JSON.stringify(lastRefresh)).not.toContain('SECRET');
  });

  it('reports a cache miss with an unknown verdict and no timestamps', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_MISS');
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.cacheState).toBe('MISS');
    expect(data.verdict).toBe('UNKNOWN');
    expect(data.freshness).toBe('UNAVAILABLE');
    expect(data.asOf).toBeNull();
    expect(data.receivedAt).toBeNull();
    expect(data.ageSeconds).toBeNull();
    expect(data.timestampEvidence).toBe('NOT_AVAILABLE');
    expect(data.eligibleForUse).toBe(false);
    expect(data.suppressExecution).toBe(true);
    expect((data.lastRefresh as Record<string, unknown>).outcome).toBe('UNKNOWN');
  });

  it('reports invalid timestamp evidence as unavailable, never as fresh', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_INVALID_TIMESTAMP');
    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.timestampEvidence).toBe('INVALID');
    expect(data.freshness).toBe('UNAVAILABLE');
    expect(data.asOf).toBeNull();
    expect(data.ageSeconds).toBeNull();
    expect(data.suppressExecution).toBe(true);
  });

  it('carries the D02 limitation unchanged: NOT_AVAILABLE cache and UNKNOWN verdict', async () => {
    const response = await callFreshness('?domain=D02_OHLCV', 'FRESHNESS_D02_NOT_AVAILABLE');
    expect(response.status).toBe(200);

    const data = (response.body as { data: Record<string, unknown> }).data;
    expect(data.domain).toBe('D02_OHLCV');
    expect(data.cacheState).toBe('NOT_AVAILABLE');
    expect(data.verdict).toBe('UNKNOWN');
    expect(data.freshness).toBe('UNAVAILABLE');
    expect(data.asOf).toBeNull();
    expect(data.ageSeconds).toBeNull();
    expect(data.evidenceAvailable).toBe(false);
    // The domain threshold IS provided, even though the evidence is not.
    expect(data.thresholdSeconds).toBe(86_400);
    expect((data.lastRefresh as Record<string, unknown>).outcome).toBe('UNKNOWN');
  });

  it('explains the D02 limitation in words rather than leaving it to be inferred', async () => {
    const response = await callFreshness('?domain=D02_OHLCV', 'FRESHNESS_D02_NOT_AVAILABLE');
    const data = (response.body as { data: Record<string, unknown> }).data;
    const explanation = String(data.explanation);
    expect(explanation).toContain('No cache or refresh evidence is available for this domain');
    expect(explanation).toContain('not an absence of observations');
  });

  it('rejects a request with no domain', async () => {
    const response = await callFreshness('', 'FRESHNESS_D01_CURRENT');
    expect(response.status).toBe(400);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('MALFORMED_REQUEST');
    expect(error.connectionAttempted).toBe(false);
  });

  it('rejects a D01 request with no exact quote scope', async () => {
    for (const query of [
      '?domain=D01_QUOTES',
      '?domain=D01_QUOTES&companyId=SYNTHETIC:COMPANY',
      '?domain=D01_QUOTES&companyId=SYNTHETIC:COMPANY&exchangeSegment=NSE_EQ',
      '?domain=D01_QUOTES&companyId=SYNTHETIC:COMPANY&exchangeSegment=BAD_SEG&securityId=ISIN:INE002A01018:EQ',
      '?domain=D01_QUOTES&companyId=SYNTHETIC:COMPANY&exchangeSegment=NSE_EQ&securityId=not-an-identity',
    ]) {
      const response = await callFreshness(query, 'FRESHNESS_D01_CURRENT');
      expect(response.status, `expected ${query} to be rejected`).toBe(400);
    }
  });

  it('rejects a D02 request that carries extra parameters', async () => {
    const response = await callFreshness('?domain=D02_OHLCV&companyId=SYNTHETIC:COMPANY', 'FRESHNESS_D02_NOT_AVAILABLE');
    expect(response.status).toBe(400);
  });

  it('rejects a malformed freshness payload rather than projecting it', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_MALFORMED_RESPONSE');
    expect(response.status).toBe(502);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('MALFORMED_RESPONSE');
  });

  it('reports an unreachable transport distinctly', async () => {
    const response = await callFreshness(D01_QUERY, 'TRANSPORT_UNAVAILABLE');
    expect(response.status).toBe(502);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('TRANSPORT_FAILURE');
    expect(error.connectionAttempted).toBe(true);
  });

  it('reports a transport timeout distinctly', async () => {
    const response = await callFreshness(D01_QUERY, 'TRANSPORT_TIMEOUT');
    expect(response.status).toBe(504);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('REQUEST_TIMEOUT');
    expect(error.connectionAttempted).toBe(true);
  });

  it('reports an unauthenticated transport distinctly', async () => {
    const response = await callFreshness(D01_QUERY, 'TRANSPORT_UNAUTHENTICATED');
    expect(response.status).toBe(401);
    const error = (response.body as { error: Record<string, unknown> }).error;
    expect(error.code).toBe('UNAUTHENTICATED');
  });

  it('answers 503 when the transport is not configured at all', async () => {
    const server = http.createServer((req, res) => {
      void handleDhanFreshnessRequest(req, res, { env: {} });
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}${DHAN_FRESHNESS_PATH}${D01_QUERY}`);
      expect(response.status).toBe(503);
      const body = (await response.json()) as { error: Record<string, unknown> };
      expect(body.error.code).toBe('NOT_CONFIGURED');
      // Nothing was attempted: the system is not connected, not disconnected.
      expect(body.error.connectionAttempted).toBe(false);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('never publishes the transport token', async () => {
    const response = await callFreshness(D01_QUERY, 'FRESHNESS_D01_CURRENT');
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain('synthetic-transport-token');
    expect(serialized).not.toMatch(/Bearer\s/);
  });

  it('rejects a non-GET method', async () => {
    const server = http.createServer((req, res) => {
      void handleDhanFreshnessRequest(req, res, transport.deps());
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const response = await fetch(`http://127.0.0.1:${port}${DHAN_FRESHNESS_PATH}${D01_QUERY}`, {
        method: 'POST',
      });
      expect(response.status).toBe(404);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe('DHAN-P5 freshness verdict mapping', () => {
  it('maps IPD GOOD to IRR SNAPSHOT, never to LIVE', () => {
    expect(mapIpdVerdictToIrrFreshness('GOOD')).toBe('SNAPSHOT');
  });

  it('maps IPD STALE to IRR STALE', () => {
    expect(mapIpdVerdictToIrrFreshness('STALE')).toBe('STALE');
  });

  it('maps IPD UNAVAILABLE to IRR UNAVAILABLE', () => {
    expect(mapIpdVerdictToIrrFreshness('UNAVAILABLE')).toBe('UNAVAILABLE');
  });

  it('maps IPD UNKNOWN to IRR UNAVAILABLE and never to a usable state', () => {
    expect(mapIpdVerdictToIrrFreshness('UNKNOWN')).toBe('UNAVAILABLE');
  });

  it('never produces LIVE for any verdict', () => {
    for (const verdict of ['GOOD', 'STALE', 'UNAVAILABLE', 'UNKNOWN', 'SOMETHING_ELSE', '']) {
      expect(mapIpdVerdictToIrrFreshness(verdict)).not.toBe('LIVE');
    }
  });
});

describe('DHAN-P5 freshness status projection', () => {
  it('projects every IPD field without recomputing any of them', () => {
    const view = projectIpdFreshnessStatus(
      syntheticFreshnessStatus({
        cacheState: 'STALE',
        verdict: 'STALE',
        ageSeconds: 1200,
        staleConcessionActive: true,
        lastRefreshOutcome: 'FAILURE',
        lastFailure: { code: 'REFRESH_FAILED', priorPreserved: false },
      }) as never,
    );

    expect(view.cacheState).toBe('STALE');
    expect(view.verdict).toBe('STALE');
    expect(view.freshness).toBe('STALE');
    expect(view.ageSeconds).toBe(1200);
    expect(view.staleConcessionActive).toBe(true);
    expect(view.lastRefresh.outcome).toBe('FAILURE');
    expect(view.lastRefresh.lastFailure).toEqual({ code: 'REFRESH_FAILED', priorPreserved: false });
  });

  it('marks the evidence as unavailable for a NOT_AVAILABLE cache state', () => {
    const view = projectIpdFreshnessStatus(
      syntheticFreshnessStatus({
        domain: 'D02_OHLCV',
        cacheState: 'NOT_AVAILABLE',
        verdict: 'UNKNOWN',
      }) as never,
    );
    expect(view.evidenceAvailable).toBe(false);
    expect(view.explanation).toContain('No cache or refresh evidence is available');
  });
});

describe('DHAN-P5 freshness query validation', () => {
  it('accepts a complete D01 scope', () => {
    const parsed = parseFreshnessQuery(
      new URLSearchParams(
        'domain=D01_QUOTES&companyId=C&exchangeSegment=NSE_EQ&securityId=ISIN:INE002A01018:EQ',
      ),
    );
    expect(parsed.ok).toBe(true);
    expect(parsed.ok && parsed.query.domain).toBe('D01_QUOTES');
  });

  it('accepts the D02 domain alone', () => {
    const parsed = parseFreshnessQuery(new URLSearchParams('domain=D02_OHLCV'));
    expect(parsed.ok).toBe(true);
    expect(parsed.ok && parsed.query.domain).toBe('D02_OHLCV');
  });

  it('rejects an unknown domain', () => {
    expect(parseFreshnessQuery(new URLSearchParams('domain=D99_OTHER')).ok).toBe(false);
  });

  it('rejects a duplicate parameter', () => {
    const parsed = parseFreshnessQuery(
      new URLSearchParams('domain=D02_OHLCV&domain=D02_OHLCV'),
    );
    expect(parsed.ok).toBe(false);
  });
});
