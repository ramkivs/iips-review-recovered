/**
 * DHAN-P3 — quote and historical surface tests.
 *
 * These qualify the rendered experience: the freshness verdict is shown as the server
 * resolved it, a STALE quote is never presented as current, an identity failure is
 * distinguished from unavailable market data, the empty series is an explicit empty result,
 * and the browser never transmits a credential.
 *
 * Every payload below is synthetic and is labelled as such.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { DhanQuotes, buildDhanQuoteRequest, exchangeSegmentFor } from './DhanQuotes';
import { DhanHistorical, validateHistoricalRange } from './DhanHistorical';

function quoteBody(overrides: Record<string, unknown> = {}) {
  return {
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
      ...overrides,
    },
  };
}

function historicalBody(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      freshness: 'SNAPSHOT',
      candles: [
        {
          candleStart: '2026-11-01T00:00:00.000Z',
          candleEnd: '2026-11-01T23:59:59.999Z',
          interval: '1d',
          open: 100,
          high: 101,
          low: 99,
          close: 100.5,
          volume: 1000,
          vwap: 100.25,
          tradeCount: 10,
          isAdjusted: false,
        },
      ],
      returnedCandleCount: 1,
      requestedFromDate: '2026-11-01',
      requestedToDate: '2026-11-03',
      coverageClaim: 'ACCESS_PENDING_UNVERIFIED',
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      ...overrides,
    },
  };
}

function okFetch(body: unknown) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response));
}

function errFetch(status: number, error: Record<string, unknown>) {
  return vi.fn((_url: string, _init?: RequestInit) =>
    Promise.resolve({ ok: false, status, json: () => Promise.resolve({ error }) } as Response));
}

/* ------------------------------------------------------------------------ */
/* W-15 helpers: the quote form is driven by the instrument-search picker.  */
/* ------------------------------------------------------------------------ */

const QUALIFIED_ROW = {
  symbol: 'SYNTH',
  exchange: 'NSE' as const,
  result: {
    status: 'QUALIFIED' as const,
    securityIdentity: {
      securityId: 'ISIN:INE002A01018:EQ' as const,
      isin: 'INE002A01018',
      series: 'EQ',
      isinAuthority: 'NON_AUTHORITATIVE' as const,
    },
    companyId: 'SYNTHETIC:COMPANY',
    exchange: 'NSE' as const,
    isinAuthority: 'NON_AUTHORITATIVE' as const,
  },
};

const QUALIFIED_ROW_BSE = {
  symbol: 'SYNTH-BSE',
  exchange: 'BSE' as const,
  result: {
    status: 'QUALIFIED' as const,
    securityIdentity: {
      securityId: 'ISIN:INE002A01019:EQ' as const,
      isin: 'INE002A01019',
      series: 'EQ',
      isinAuthority: 'NON_AUTHORITATIVE' as const,
    },
    companyId: 'SYNTHETIC:COMPANY-BSE',
    exchange: 'BSE' as const,
    isinAuthority: 'NON_AUTHORITATIVE' as const,
  },
};

const UNRESOLVED_ROW = {
  symbol: 'SYNTH-UNRESOLVED',
  exchange: 'NSE' as const,
  result: { status: 'UNRESOLVED' as const, reason: 'MISSING_P7_MAPPING', details: 'P7 evidence is missing.' },
};

function searchBody(results: readonly unknown[] = [QUALIFIED_ROW]) {
  return {
    data: { results },
    provenance: { authority: 'IPD', mode: 'SNAPSHOT', dataVersion: 'ipd-p4-identity-http' },
  };
}

type QuoteFetchResult = { readonly ok: true; readonly body: unknown } | { readonly ok: false; readonly status: number; readonly error: Record<string, unknown> };

/**
 * Routes the stubbed global fetch by URL: the instrument-search route gets the search body,
 * the quotes route gets the queued quote result(s). Anything else rejects.
 */
function dhanQuoteFetch(search: unknown, quoteResults: readonly QuoteFetchResult[]) {
  let quoteCall = 0;
  return vi.fn((url: string, _init?: RequestInit) => {
    if (String(url).includes('/api/dhan/instruments/search')) {
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(search) } as Response);
    }
    if (String(url).includes('/api/dhan/quotes')) {
      const result = quoteResults[Math.min(quoteCall, quoteResults.length - 1)]!;
      quoteCall += 1;
      return result.ok
        ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(result.body) } as Response)
        : Promise.resolve({ ok: false, status: result.status, json: () => Promise.resolve({ error: result.error }) } as Response);
    }
    return Promise.reject(new Error(`unexpected fetch url: ${String(url)}`));
  });
}

function quoteOk(body: unknown): QuoteFetchResult {
  return { ok: true, body };
}
function quoteErr(status: number, error: Record<string, unknown>): QuoteFetchResult {
  return { ok: false, status, error };
}

/** Runs a search and selects the `index`-th QUALIFIED result, as an operator would. */
async function searchAndPick(index = 0, query = 'SYNTH'): Promise<void> {
  fireEvent.change(screen.getByTestId('dhan-quote-search-query'), { target: { value: query } });
  fireEvent.click(screen.getByTestId('dhan-quote-search-submit'));
  await screen.findByTestId('dhan-quote-search-results');
  fireEvent.click(screen.getAllByTestId('dhan-quote-pick')[index]!);
}

/** Selects an instrument from the search results and submits the quote form. */
async function submitQuote(): Promise<void> {
  await searchAndPick(0);
  fireEvent.click(screen.getByTestId('dhan-quote-submit'));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DHAN-P3 quote surface', () => {
  it('renders the surface with a data-testid on every element', () => {
    render(<DhanQuotes />);
    expect(screen.getByTestId('dhan-quotes-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-form')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-search-query')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-search-submit')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-selected')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-segment')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-submit')).toBeTruthy();
    // W-15: there is no free-text identity entry on the surface any more.
    expect(screen.queryByTestId('dhan-quote-company')).toBeNull();
    expect(screen.queryByTestId('dhan-quote-security')).toBeNull();
  });

  it('keeps the submit disabled until a QUALIFIED search result is selected', async () => {
    render(<DhanQuotes />);
    expect((screen.getByTestId('dhan-quote-submit') as HTMLButtonElement).disabled).toBe(true);
    await waitFor(() => expect(screen.getByTestId('dhan-quote-identity-hint')).toBeTruthy());
  });

  it('renders a successful quote with its freshness, provenance and timestamps', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    expect(screen.getByTestId('dhan-quote-symbol').textContent).toContain('SYNTH');
    expect(screen.getByTestId('dhan-quote-as-of').textContent).toBe('2026-11-06T10:15:00.000Z');
    expect(screen.getByTestId('dhan-quote-received-at').textContent).toBe('2026-11-06T10:15:00.120Z');
    expect(screen.getByTestId('dhan-quote-evaluated-at').textContent).toBe('2026-11-06T10:15:00.121Z');
    expect(screen.getByTestId('dhan-quote-security-id').textContent).toBe('ISIN:INE002A01018:EQ');
    expect(screen.getByTestId('dhan-quote-source-classification').textContent).toBe(
      'CANONICAL_MARKET_DATA',
    );
    expect(screen.getByTestId('dhan-quote-data-version').textContent).toBe('synthetic-fixture-v1');
  });

  it.each([[null, null], [99, null], [null, 101], [99, 101]] as const)(
    'renders bid %s and ask %s without substituting last traded price', async (bid, ask) => {
      const quote = { ...quoteBody().data.quote, bid, ask };
      vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({ quote }))]));
      render(<DhanQuotes />);
      await submitQuote();
      await screen.findByTestId('dhan-quote-result');
      for (const [label, expected] of [['Bid', bid], ['Ask', ask]] as const) {
        const card = screen.getByText(label).closest('[data-testid="metric-card"]');
        expect(card?.querySelector('[data-testid="metric-value"]')?.textContent)
          .toBe(expected === null ? 'unavailable' : String(expected));
      }
    },
  );

  it('publishes the provider qualification and never implies live qualification', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-qualification').textContent).toBe(
      'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    );
  });

  it('never renders a quote as LIVE', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({ freshness: 'SNAPSHOT' }))]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    // The freshness badge is the only thing that may assert a freshness verdict, and it must
    // not read LIVE. (The provider qualification contains the substring "LIVE_QUALIFIED",
    // which is a DIFFERENT statement — that the provider is NOT live-qualified.)
    const badge = screen.getByTestId('dhan-quote-result').querySelector('[data-testid^="freshness-"]');
    expect(badge).not.toBeNull();
    expect(badge?.getAttribute('data-testid')).toBe('freshness-snapshot');
    expect(screen.queryByTestId('freshness-live')).toBeNull();
  });

  it('renders a STALE quote as stale and says so explicitly', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({ freshness: 'STALE', qualityState: 'STALE' }))]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-stale-notice')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-stale-notice').textContent).toContain('not a current price');
    // The freshness badge must read STALE — a stale observation is never dressed up as
    // current.
    expect(screen.getByTestId('freshness-stale')).toBeTruthy();
    expect(screen.queryByTestId('freshness-snapshot')).toBeNull();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
  });

  it('renders an UNAVAILABLE observation without presenting it as current', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({ freshness: 'UNAVAILABLE', qualityState: 'UNAVAILABLE' }))]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-unavailable-notice').textContent).toContain(
      'outside the freshness-use policy',
    );
    expect(screen.getByTestId('freshness-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('freshness-snapshot')).toBeNull();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
  });

  it('shows a loading state while the request is in flight', async () => {
    let resolveQuote: ((value: Response) => void) | null = null;
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('/api/dhan/instruments/search')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(searchBody()) } as Response);
      }
      return new Promise<Response>((resolve) => { resolveQuote = resolve; });
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('state-loading')).toBeTruthy());
    await act(async () => {
      resolveQuote?.({ ok: true, status: 200, json: () => Promise.resolve(quoteBody()) } as Response);
    });
  });

  it('distinguishes an identity failure from unavailable market data', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteErr(400, {
      code: 'MISSING_REQUIRED_FIELD',
      message: 'securityId is required',
      identityFailure: true,
      connectionAttempted: false,
    })]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-failure-kind').textContent).toBe('Request rejected');
  });

  it('distinguishes a transport failure from a request failure', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteErr(401, {
      code: 'UNAUTHENTICATED',
      message: 'missing or invalid transport credential',
      identityFailure: false,
      connectionAttempted: true,
    })]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-failure-kind').textContent).toBe('Transport unavailable');
  });

  it('offers a retry after a failure', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [
      quoteErr(502, { code: 'TRANSPORT_FAILURE', message: 'connection refused', identityFailure: false, connectionAttempted: true }),
      quoteErr(502, { code: 'TRANSPORT_FAILURE', message: 'connection refused', identityFailure: false, connectionAttempted: true }),
    ]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    fireEvent.click(screen.getByTestId('dhan-quote-retry'));
    await waitFor(() => {
      const quoteCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/dhan/quotes'));
      expect(quoteCalls).toHaveLength(2);
    });
  });

  it('never renders a stale quote after a failed refresh', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [
      quoteOk(quoteBody()),
      quoteErr(502, { code: 'TRANSPORT_FAILURE', message: 'down', identityFailure: false, connectionAttempted: true }),
    ]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    fireEvent.click(screen.getByTestId('dhan-quote-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    // The previous quote must not linger on screen pretending to be current.
    expect(screen.queryByTestId('dhan-quote-result')).toBeNull();
  });

  it('never sends an Authorization header', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    // Every request the surface made — search and quote alike — must be credential-free.
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    for (const call of fetchMock.mock.calls) {
      const headers = (call[1]?.headers ?? {}) as Record<string, string>;
      for (const key of Object.keys(headers)) {
        expect(key.toLowerCase()).not.toBe('authorization');
      }
    }
  });

  it('embeds the provider freshness status in the quote view', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({
      freshnessStatus: {
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
      freshnessStatusFailure: null,
    }))]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    expect(screen.getByTestId('dhan-freshness-verdict').textContent).toBe('GOOD');
    expect(screen.getByTestId('dhan-freshness-threshold').textContent).toBe('900 s');
    expect(screen.getByTestId('dhan-freshness-last-refresh').textContent).toBe('SUCCESS');
  });

  it('states that the freshness evidence is unknown when it could not be read', async () => {
    vi.stubGlobal('fetch', dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({
      freshnessStatus: null,
      freshnessStatusFailure: { code: 'TRANSPORT_FAILURE', message: 'market-data transport request failed' },
    }))]));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    expect(screen.getByTestId('dhan-freshness-failure-code').textContent).toBe('TRANSPORT_FAILURE');
    expect(screen.getByTestId('dhan-freshness-unknown-notice').textContent).toContain(
      'not a statement that the data is current',
    );
  });
});

describe('DHAN-P3 historical surface', () => {
  it('renders the surface with a data-testid on every element', () => {
    render(<DhanHistorical />);
    expect(screen.getByTestId('dhan-historical-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-form')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-company')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-isin')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-segment')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-interval')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-from')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-to')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-submit')).toBeTruthy();
  });

  it('renders candles with the requested inclusive range and coverage claim', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody()));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-historical-range').textContent).toContain('2026-11-01');
    expect(screen.getByTestId('dhan-historical-range').textContent).toContain('inclusive');
    expect(screen.getByTestId('dhan-historical-count').textContent).toBe('1');
    expect(screen.getByTestId('dhan-historical-coverage').textContent).toBe(
      'ACCESS_PENDING_UNVERIFIED',
    );
    expect(screen.getByTestId('dhan-historical-qualification').textContent).toBe(
      'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    );
    expect(screen.getByTestId('data-table')).toBeTruthy();
    // The freshness badge must not read LIVE.
    expect(screen.getByTestId('freshness-snapshot')).toBeTruthy();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
    // D-4.4: unadjusted D02 candles must surface explicit corporate-action disclosure.
    expect(screen.getByTestId('status-warning')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-adjustment-status').textContent).toBe(
      'Unadjusted for corporate actions (splits/bonuses/dividends)',
    );
    expect(screen.getByTestId('dhan-historical-unadjusted-disclosure').textContent).toContain(
      'Unadjusted for corporate actions (splits/bonuses/dividends)',
    );
    expect(screen.getByTestId('dhan-historical-unadjusted-disclosure').textContent).toContain(
      'prohibited from driving split-sensitive valuation or portfolio return attribution',
    );
  });

  it('renders an empty series as an explicit empty result, not a failure', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody({ candles: [], returnedCandleCount: 0 })));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-historical-empty')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-empty').textContent).toContain('not a failure');
    expect(screen.getByTestId('dhan-historical-adjustment-status').textContent).toBe('no candles returned');
    expect(screen.queryByTestId('dhan-historical-unadjusted-disclosure')).toBeNull();
    expect(screen.queryByTestId('dhan-historical-failure')).toBeNull();
  });

  it('discloses mixed adjustment status and retains the unadjusted warning when any candle is unadjusted', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody({
      returnedCandleCount: 2,
      candles: [
        {
          candleStart: '2026-10-31T00:00:00.000Z',
          interval: '1D',
          open: 100,
          high: 102,
          low: 99,
          close: 101,
          volume: 1000,
          vwap: null,
          isAdjusted: true,
        },
        {
          candleStart: '2026-11-01T00:00:00.000Z',
          interval: '1D',
          open: 101,
          high: 103,
          low: 100,
          close: 102,
          volume: 1200,
          vwap: null,
          isAdjusted: false,
        },
      ],
    })));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-result')).toBeTruthy());
    expect(screen.getByTestId('status-warning').textContent).toContain('Mixed');
    expect(screen.getByTestId('dhan-historical-adjustment-status').textContent).toBe(
      'Mixed: 1 of 2 candles unadjusted for corporate actions (splits/bonuses/dividends)',
    );
    expect(screen.getByTestId('dhan-historical-unadjusted-disclosure')).toBeTruthy();
  });

  it('omits the unadjusted warning banner when all returned candles are adjusted', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody({
      returnedCandleCount: 1,
      candles: [
        {
          candleStart: '2026-11-01T00:00:00.000Z',
          interval: '1D',
          open: 100,
          high: 102,
          low: 99,
          close: 101,
          volume: 1000,
          vwap: null,
          isAdjusted: true,
        },
      ],
    })));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-result')).toBeTruthy());
    expect(screen.getByTestId('status-positive').textContent).toContain('Adjusted for corporate actions');
    expect(screen.getByTestId('dhan-historical-adjustment-status').textContent).toBe(
      'Adjusted for corporate actions',
    );
    expect(screen.queryByTestId('dhan-historical-unadjusted-disclosure')).toBeNull();
  });

  it('rejects an inverted date range without contacting the server', async () => {
    const fetchMock = okFetch(historicalBody());
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.change(screen.getByTestId('dhan-historical-from'), { target: { value: '2026-10-31' } });
    fireEvent.change(screen.getByTestId('dhan-historical-to'), { target: { value: '2026-10-01' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-range-error')).toBeTruthy());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a window beyond the maximum without contacting the server', async () => {
    const fetchMock = okFetch(historicalBody());
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.change(screen.getByTestId('dhan-historical-from'), { target: { value: '2020-01-01' } });
    fireEvent.change(screen.getByTestId('dhan-historical-to'), { target: { value: '2026-10-31' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-range-error')).toBeTruthy());
    expect(screen.getByTestId('dhan-historical-range-error').textContent).toContain('1825');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('offers every supported interval', () => {
    render(<DhanHistorical />);
    const select = screen.getByTestId('dhan-historical-interval') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual(['1m', '5m', '15m', '1h', '1D']);
  });

  it('reports a transport failure distinctly', async () => {
    vi.stubGlobal('fetch', errFetch(502, {
      code: 'TRANSPORT_FAILURE',
      message: 'connection refused',
      identityFailure: false,
      connectionAttempted: true,
    }));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-failure')).toBeTruthy());
    expect(screen.getByTestId('dhan-historical-failure-kind').textContent).toBe('Transport unavailable');
  });

  it('carries the D02 freshness limitation into the historical view', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody({
      freshnessStatus: {
        domain: 'D02_OHLCV',
        freshness: 'UNAVAILABLE',
        verdict: 'UNKNOWN',
        cacheState: 'NOT_AVAILABLE',
        asOf: null,
        receivedAt: null,
        evaluatedAt: '2026-11-06T10:15:00.121Z',
        observationEvaluatedAt: null,
        timestampEvidence: 'NOT_AVAILABLE',
        thresholdSeconds: 86400,
        ageSeconds: null,
        staleConcessionActive: false,
        suppressExecution: true,
        eligibleForUse: false,
        lastRefresh: { outcome: 'UNKNOWN', lastFailure: null },
        evidenceAvailable: false,
        explanation: 'No cache or refresh evidence is available for this domain.',
      },
      freshnessStatusFailure: null,
    })));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-freshness-panel')).toBeTruthy());
    // The D02 limitation is stated, not inferred.
    expect(screen.getByTestId('dhan-freshness-d02-limitation')).toBeTruthy();
    expect(screen.getByTestId('dhan-freshness-verdict').textContent).toBe('UNKNOWN');
    expect(screen.getByTestId('dhan-freshness-as-of').textContent).toBe('unavailable');
    // The threshold is still published even though the evidence is not.
    expect(screen.getByTestId('dhan-freshness-threshold').textContent).toBe('86400 s');
  });
});

describe('DHAN-P3 historical range validation', () => {
  it('accepts a valid inclusive range', () => {
    expect(validateHistoricalRange('2026-10-01', '2026-10-31')).toBeNull();
  });

  it('accepts a single-day range', () => {
    expect(validateHistoricalRange('2026-10-01', '2026-10-01')).toBeNull();
  });

  it('rejects a non-ISO date', () => {
    expect(validateHistoricalRange('01-10-2026', '2026-10-31')).toContain('ISO calendar dates');
  });

  it('rejects an inverted range', () => {
    expect(validateHistoricalRange('2026-10-31', '2026-10-01')).toContain('must not be after');
  });

  it('rejects a window beyond 1825 days', () => {
    expect(validateHistoricalRange('2020-01-01', '2026-10-31')).toContain('exceeds the maximum');
  });

  it('accepts exactly 1825 inclusive days', () => {
    expect(validateHistoricalRange('2021-01-01', '2025-12-30')).toBeNull();
  });

  it('rejects 1826 inclusive days', () => {
    expect(validateHistoricalRange('2021-01-01', '2025-12-31')).toContain('exceeds the maximum');
  });
});

/* ------------------------------------------------------------------------ */
/* W-15 — quote identity picker and honest field rendering.                  */
/* All payloads are synthetic fixtures, labelled as such.                    */
/* ------------------------------------------------------------------------ */
describe('W-15 quote identity picker', () => {
  function quoteRequestBodies(fetchMock: ReturnType<typeof vi.fn>): Record<string, unknown>[] {
    return fetchMock.mock.calls
      .filter(([url]) => String(url).includes('/api/dhan/quotes'))
      .map(([, init]) => JSON.parse(String(init?.body)) as Record<string, unknown>);
  }

  it('maps listing exchanges onto quote exchange segments', () => {
    expect(exchangeSegmentFor('NSE')).toBe('NSE_EQ');
    expect(exchangeSegmentFor('BSE')).toBe('BSE_EQ');
  });

  it('buildDhanQuoteRequest preserves exact-identity validation', () => {
    // valid canonical identity -> a well-formed request
    expect(buildDhanQuoteRequest('COMP-A', 'ISIN:INE002A01018:EQ', 'NSE_EQ')).toEqual({
      companyId: 'COMP-A',
      securityId: 'ISIN:INE002A01018:EQ',
      exchangeSegment: 'NSE_EQ',
    });
    // the segment is optional
    expect(buildDhanQuoteRequest('COMP-A', 'ISIN:INE002A01018:EQ', '')).toEqual({
      companyId: 'COMP-A',
      securityId: 'ISIN:INE002A01018:EQ',
    });
    // anything that is not an exact canonical identity yields NO request at all
    for (const bad of [
      ['', 'ISIN:INE002A01018:EQ'],
      ['COMP-A', 'garbage'],
      ['COMP-A', 'INE002A01018'],
      ['COMP-A', 'ISIN:INE002A01018'],       // missing series
      ['COMP-A', 'ISIN:INE002A01018:EQ:EXTRA'],
      ['COMP-A', 'ISIN:INE002A0101:EQ'],      // ISIN must be exactly 12 alphanumeric
      ['COMP-A', 'ISIN:INE002A01018:'],       // empty series
      ['COMP-A', ''],
    ] as const) {
      expect(buildDhanQuoteRequest(bad[0], bad[1], '')).toBeNull();
    }
    // The D114 grammar is preserved unchanged: surrounding whitespace is trimmed and the
    // 12-char alphanumeric ISIN check is exactly the pre-W-15 client pattern.
    expect(buildDhanQuoteRequest('COMP-A', ' ISIN:INE002A01018:EQ ', '')).toEqual({
      companyId: 'COMP-A',
      securityId: 'ISIN:INE002A01018:EQ',
    });
  });

  it('case 1: selecting a search result generates a well-formed quote request', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);

    await searchAndPick(0);
    fireEvent.click(screen.getByTestId('dhan-quote-submit'));
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    const bodies = quoteRequestBodies(fetchMock);
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).toEqual({
      companyId: 'SYNTHETIC:COMPANY',
      securityId: 'ISIN:INE002A01018:EQ',
      exchangeSegment: 'NSE_EQ',
    });
  });

  it('case 1b: a BSE result maps to BSE_EQ in the generated request', async () => {
    const fetchMock = dhanQuoteFetch(searchBody([QUALIFIED_ROW, QUALIFIED_ROW_BSE]), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);

    await searchAndPick(1);
    fireEvent.click(screen.getByTestId('dhan-quote-submit'));
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    expect(quoteRequestBodies(fetchMock)[0]).toEqual({
      companyId: 'SYNTHETIC:COMPANY-BSE',
      securityId: 'ISIN:INE002A01019:EQ',
      exchangeSegment: 'BSE_EQ',
    });
  });

  it('case 2: the exact identity is preserved verbatim through selection and request', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);

    await searchAndPick(0);
    // the selected identity is displayed exactly as the search result supplied it
    expect(screen.getByTestId('dhan-quote-selected').textContent).toBe(
      'SYNTHETIC:COMPANY · ISIN:INE002A01018:EQ · NSE_EQ',
    );
    fireEvent.click(screen.getByTestId('dhan-quote-submit'));
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    const bodies = quoteRequestBodies(fetchMock);
    expect(bodies[0]?.securityId).toBe('ISIN:INE002A01018:EQ');
    expect(screen.getByTestId('dhan-quote-security-id').textContent).toBe('ISIN:INE002A01018:EQ');
  });

  it('case 2b: non-QUALIFIED results cannot be selected and cannot produce a request', async () => {
    const fetchMock = dhanQuoteFetch(searchBody([UNRESOLVED_ROW]), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);

    fireEvent.change(screen.getByTestId('dhan-quote-search-query'), { target: { value: 'SYNTH' } });
    fireEvent.click(screen.getByTestId('dhan-quote-search-submit'));
    await screen.findByTestId('dhan-quote-search-results');

    expect(screen.queryAllByTestId('dhan-quote-pick')).toHaveLength(0);
    expect((screen.getByTestId('dhan-quote-submit') as HTMLButtonElement).disabled).toBe(true);
    expect(quoteRequestBodies(fetchMock)).toHaveLength(0);
  });

  it('case 2c: no quote request is issued without a selected identity', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);

    // Submit is disabled; even a forced form submit must not build a request.
    fireEvent.submit(screen.getByTestId('dhan-quote-form'));
    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    expect(quoteRequestBodies(fetchMock)).toHaveLength(0);
    // The search route may be called only by an explicit search, never by submit.
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/dhan/quotes'))).toHaveLength(0);
  });

  it('case 3: absent bid/ask render as "unavailable", never 0 or the last traded price', async () => {
    const quote = { ...quoteBody().data.quote, bid: null, ask: null };
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({ quote }))]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();
    await screen.findByTestId('dhan-quote-result');

    for (const label of ['Bid', 'Ask']) {
      const card = screen.getByText(label).closest('[data-testid="metric-card"]');
      const value = card?.querySelector('[data-testid="metric-value"]')?.textContent;
      expect(value).toBe('unavailable');
      expect(value).not.toBe('0');
      expect(value).not.toBe(String(quote.ltp));
    }
    // the rest of the quote still renders
    expect(screen.getByTestId('dhan-quote-symbol').textContent).toContain('SYNTH');
  });

  it('case 4: a STALE quote is never rendered as current', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody({ freshness: 'STALE', qualityState: 'STALE' }))]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();
    await screen.findByTestId('dhan-quote-result');

    expect(screen.getByTestId('dhan-quote-stale-notice').textContent).toContain('not a current price');
    expect(screen.getByTestId('freshness-stale')).toBeTruthy();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
    expect(screen.queryByTestId('freshness-snapshot')).toBeNull();
  });

  it('case 5: existing quote behaviour is intact after the picker change', async () => {
    const fetchMock = dhanQuoteFetch(searchBody(), [quoteOk(quoteBody())]);
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    expect(screen.getByTestId('dhan-quote-symbol').textContent).toContain('SYNTH');
    expect(screen.getByTestId('dhan-quote-as-of').textContent).toBe('2026-11-06T10:15:00.000Z');
    expect(screen.getByTestId('dhan-quote-received-at').textContent).toBe('2026-11-06T10:15:00.120Z');
    expect(screen.getByTestId('dhan-quote-evaluated-at').textContent).toBe('2026-11-06T10:15:00.121Z');
    expect(screen.getByTestId('dhan-quote-security-id').textContent).toBe('ISIN:INE002A01018:EQ');
    expect(screen.getByTestId('dhan-quote-source-classification').textContent).toBe('CANONICAL_MARKET_DATA');
    expect(screen.getByTestId('dhan-quote-data-version').textContent).toBe('synthetic-fixture-v1');
    expect(screen.getByTestId('dhan-quote-qualification').textContent).toBe('SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED');
    expect(screen.getByTestId('freshness-snapshot')).toBeTruthy();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
    // the search went to the identity route, the quote to the quotes route — and nothing else
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls).toEqual(['/api/dhan/instruments/search', '/api/dhan/quotes']);
  });

  it('case 5b: a search failure is shown as an identity-search problem, not market data', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes('/api/dhan/instruments/search')) {
        return Promise.resolve({
          ok: false,
          status: 503,
          json: () => Promise.resolve({ error: { code: 'TRANSPORT_UNAVAILABLE', message: 'The IPD service could not be reached.' } }),
        } as Response);
      }
      return Promise.reject(new Error(`unexpected fetch url: ${String(url)}`));
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);

    fireEvent.change(screen.getByTestId('dhan-quote-search-query'), { target: { value: 'SYNTH' } });
    fireEvent.click(screen.getByTestId('dhan-quote-search-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-quote-search-error')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-search-error').textContent).toContain('IPD service could not be reached');
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/dhan/quotes'))).toHaveLength(0);
  });
});
