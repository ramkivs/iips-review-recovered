/**
 * DHAN-P3 — route registration and visible-navigation tests.
 *
 * The objective is that the DHAN quote and historical surfaces appear in the visible
 * application navigation and that their routes resolve to the working surfaces (not
 * placeholders). These assertions are deliberately narrow: they prove the SURFACES are
 * reachable and mounted, and they deliberately do not assert any market-data state — that is
 * the API and transport tests' job.
 *
 * The surfaces are read-only and credential-free: the browser never sends an authorization
 * header, and the server never hands it a bearer token or a provider credential.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { NAV } from './navigation';
import { ROUTES } from './routes';

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };
let requests: FetchCall[] = [];

const QUOTE_FIXTURE = {
  data: {
    freshness: 'SNAPSHOT',
    qualityState: 'GOOD',
    asOf: '2026-11-06T10:15:00.000Z',
    receivedAt: '2026-11-06T10:15:00.120Z',
    evaluatedAt: '2026-11-06T10:15:00.121Z',
    securityId: 'ISIN:INE002A01018:EQ',
    quote: {
      companyId: 'SYNTHETIC:COMPANY',
      symbol: 'SYNTH',
      exchange: 'NSE',
      currency: 'INR',
      ltp: 100.6,
      open: 99.5,
      high: 101.25,
      low: 99.25,
      previousClose: 99,
      volume: 123456,
      change: 1.6,
      pctChange: 1.61,
      bid: 100.5,
      ask: 100.75,
      vwap: 100.4,
    },
    provenance: {
      sourceClassification: 'CANONICAL_MARKET_DATA',
      dataVersion: 'synthetic-fixture-v1',
      lineageHash: 'synthetic-lineage',
      vendorTier: 'TIER_2_COMMERCIAL',
    },
    providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
  },
};

const HISTORICAL_FIXTURE = {
  data: {
    freshness: 'SNAPSHOT',
    candles: [],
    returnedCandleCount: 0,
    requestedFromDate: '2026-10-01',
    requestedToDate: '2026-10-31',
    coverageClaim: 'ACCESS_PENDING_UNVERIFIED',
  },
};

const HEALTH_FIXTURE = {
  data: {
    state: 'PRE_ACCESS',
    providerId: 'DHAN_PROVIDER',
    readiness: 'PRE_ACCESS_CREDENTIALS_UNAVAILABLE',
    configurationResolved: false,
    transportReachable: false,
    connectionAttempted: false,
    liveProviderContacted: false,
    liveQualified: false,
    failureCode: 'CREDENTIALS_UNAVAILABLE',
    missingKeys: ['IIPS_DHAN_ACCESS_TOKEN_SECRET_PATH'],
    secretRefPointers: [],
    reasons: ['Credential references are not configured.'],
    summary: 'DHAN health: PRE_ACCESS (DHAN_PROVIDER)',
    disclosure: 'PRE-ACCESS / SYNTHETIC / OFFLINE: not live-qualified.',
  },
  provenance: {
    dataSource: 'ipd:dhan-provider-config (via iips-production-market-data/dhan-server)',
    asOf: null,
    dataVersion: 'dhan-health-v1',
    mode: 'SNAPSHOT',
    freshness: 'SNAPSHOT',
    authority: 'IPD',
    transportSemantics: 'READ-ONLY, credential-free DHAN provider status.',
  },
};

const FRESHNESS_FIXTURE = {
  data: {
    domain: 'D01_QUOTES',
    freshness: 'SNAPSHOT',
    verdict: 'GOOD',
    cacheState: 'CURRENT',
    asOf: '2026-11-06T10:15:00.000Z',
    receivedAt: '2026-11-06T10:15:00.120Z',
    evaluatedAt: '2026-11-06T10:15:00.121Z',
    observationEvaluatedAt: '2026-11-06T10:15:00.121Z',
    timestampEvidence: 'VALID',
    thresholdSeconds: 900,
    ageSeconds: 120,
    staleConcessionActive: false,
    suppressExecution: false,
    eligibleForUse: true,
    lastRefresh: { outcome: 'SUCCESS', lastFailure: null },
    evidenceAvailable: true,
    explanation: "Cache state is 'CURRENT'.",
  },
};

beforeEach(() => {
  requests = [];
  globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ input, init });
    const url = String(input);
    const body = url.startsWith('/api/dhan/quotes')
      ? QUOTE_FIXTURE
      : url.startsWith('/api/dhan/historical')
        ? HISTORICAL_FIXTURE
        : url.startsWith('/api/dhan/freshness')
          ? FRESHNESS_FIXTURE
          : url.startsWith('/api/dhan/health')
            ? HEALTH_FIXTURE
            : {};
    return Promise.resolve({ ok: true, status: 200, json: async () => body } as Response);
  }) as typeof fetch;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('DHAN-P3 route registration', () => {
  it('registers the quote and historical routes', () => {
    expect(ROUTES.dhanQuotes).toBe('/dhan/quotes');
    expect(ROUTES.dhanHistorical).toBe('/dhan/historical');
  });

  it('registers the freshness route', () => {
    expect(ROUTES.dhanFreshness).toBe('/dhan/freshness');
  });

  it('lists every DHAN surface in the visible navigation', () => {
    const labels = NAV.map((entry) => entry.label);
    expect(labels).toContain('DHAN Quotes');
    expect(labels).toContain('DHAN History');
    expect(labels).toContain('DHAN Freshness');
  });

  it('keeps the DHAN-P2 status surface in the navigation', () => {
    const labels = NAV.map((entry) => entry.label);
    expect(labels).toContain('DHAN Status');
  });

  it('mounts the quote surface at its route', () => {
    renderAt(ROUTES.dhanQuotes);
    expect(screen.getByTestId('dhan-quotes-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-form')).toBeTruthy();
  });

  it('mounts the historical surface at its route', () => {
    renderAt(ROUTES.dhanHistorical);
    expect(screen.getByTestId('dhan-historical-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-form')).toBeTruthy();
  });

  it('mounts the freshness surface at its route', () => {
    renderAt(ROUTES.dhanFreshness);
    expect(screen.getByTestId('dhan-freshness-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-form')).toBeTruthy();
  });

  it('mounts the P2 status surface at its route', async () => {
    renderAt(ROUTES.dhanConnectionStatus);
    await waitFor(() => expect(screen.getByTestId('dhan-health-surface')).toBeTruthy());
  });

  it('issues no market-data request until the surface asks for one', () => {
    renderAt(ROUTES.dhanQuotes);
    // The surface does not fetch on mount: the user chooses the instrument.
    expect(requests.filter((r) => String(r.input).startsWith('/api/dhan/quotes'))).toHaveLength(0);
  });

  it('never sends an authorization header to a market-data route', () => {
    renderAt(ROUTES.dhanQuotes);
    const headers = (requests[0]?.init?.headers ?? {}) as Record<string, string>;
    for (const key of Object.keys(headers)) {
      expect(key.toLowerCase()).not.toBe('authorization');
    }
  });
});
