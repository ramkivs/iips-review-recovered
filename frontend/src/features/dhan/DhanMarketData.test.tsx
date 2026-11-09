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
import { DhanQuotes } from './DhanQuotes';
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

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Fills the quote form with a valid canonical identity and submits it. */
async function submitQuote(): Promise<void> {
  fireEvent.change(screen.getByTestId('dhan-quote-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
  fireEvent.change(screen.getByTestId('dhan-quote-security'), {
    target: { value: 'ISIN:INE002A01018:EQ' },
  });
  fireEvent.click(screen.getByTestId('dhan-quote-submit'));
}

describe('DHAN-P3 quote surface', () => {
  it('renders the surface with a data-testid on every element', () => {
    render(<DhanQuotes />);
    expect(screen.getByTestId('dhan-quotes-surface')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-form')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-company')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-security')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-segment')).toBeTruthy();
    expect(screen.getByTestId('dhan-quote-submit')).toBeTruthy();
  });

  it('renders a successful quote with its freshness, provenance and timestamps', async () => {
    vi.stubGlobal('fetch', okFetch(quoteBody()));
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

  it('publishes the provider qualification and never implies live qualification', async () => {
    vi.stubGlobal('fetch', okFetch(quoteBody()));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-qualification').textContent).toBe(
      'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
    );
  });

  it('never renders a quote as LIVE', async () => {
    vi.stubGlobal('fetch', okFetch(quoteBody({ freshness: 'SNAPSHOT' })));
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
    vi.stubGlobal('fetch', okFetch(quoteBody({ freshness: 'STALE', qualityState: 'STALE' })));
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

  it('renders an UNAVAILABLE verdict without presenting any value as a price', async () => {
    vi.stubGlobal('fetch', okFetch(quoteBody({ freshness: 'UNAVAILABLE', qualityState: 'UNAVAILABLE' })));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-unavailable-notice').textContent).toContain(
      'No value below is a price',
    );
    expect(screen.getByTestId('freshness-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('freshness-snapshot')).toBeNull();
    expect(screen.queryByTestId('freshness-live')).toBeNull();
  });

  it('shows a loading state while the request is in flight', async () => {
    let resolveFetch: ((value: Response) => void) | null = null;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve; })));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('state-loading')).toBeTruthy());
    await act(async () => {
      resolveFetch?.({ ok: true, status: 200, json: () => Promise.resolve(quoteBody()) } as Response);
    });
  });

  it('distinguishes an identity failure from unavailable market data', async () => {
    vi.stubGlobal('fetch', errFetch(400, {
      code: 'MISSING_REQUIRED_FIELD',
      message: 'securityId is required',
      identityFailure: true,
      connectionAttempted: false,
    }));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-failure-kind').textContent).toBe('Request rejected');
  });

  it('distinguishes a transport failure from a request failure', async () => {
    vi.stubGlobal('fetch', errFetch(401, {
      code: 'UNAUTHENTICATED',
      message: 'missing or invalid transport credential',
      identityFailure: false,
      connectionAttempted: true,
    }));
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    expect(screen.getByTestId('dhan-quote-failure-kind').textContent).toBe('Transport unavailable');
  });

  it('offers a retry after a failure', async () => {
    const fetchMock = errFetch(502, {
      code: 'TRANSPORT_FAILURE',
      message: 'connection refused',
      identityFailure: false,
      connectionAttempted: true,
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    fireEvent.click(screen.getByTestId('dhan-quote-retry'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('never renders a stale quote after a failed refresh', async () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(quoteBody()) } as Response));
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();
    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 502,
        json: () => Promise.resolve({ error: { code: 'TRANSPORT_FAILURE', message: 'down', identityFailure: false, connectionAttempted: true } }),
      } as Response));
    fireEvent.click(screen.getByTestId('dhan-quote-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-quote-failure')).toBeTruthy());
    // The previous quote must not linger on screen pretending to be current.
    expect(screen.queryByTestId('dhan-quote-result')).toBeNull();
  });

  it('hints at the canonical identity format when one is typed', async () => {
    render(<DhanQuotes />);
    fireEvent.change(screen.getByTestId('dhan-quote-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.change(screen.getByTestId('dhan-quote-security'), { target: { value: 'garbage' } });
    await waitFor(() => expect(screen.getByTestId('dhan-quote-identity-hint')).toBeTruthy());
  });

  it('never sends an Authorization header', async () => {
    const fetchMock = okFetch(quoteBody());
    vi.stubGlobal('fetch', fetchMock);
    render(<DhanQuotes />);
    await submitQuote();

    await waitFor(() => expect(screen.getByTestId('dhan-quote-result')).toBeTruthy());
    const headers = (fetchMock.mock.calls[0]?.[1]?.headers ?? {}) as Record<string, string>;
    for (const key of Object.keys(headers)) {
      expect(key.toLowerCase()).not.toBe('authorization');
    }
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
  });

  it('renders an empty series as an explicit empty result, not a failure', async () => {
    vi.stubGlobal('fetch', okFetch(historicalBody({ candles: [], returnedCandleCount: 0 })));
    render(<DhanHistorical />);

    fireEvent.change(screen.getByTestId('dhan-historical-company'), { target: { value: 'SYNTHETIC:COMPANY' } });
    fireEvent.click(screen.getByTestId('dhan-historical-submit'));

    await waitFor(() => expect(screen.getByTestId('dhan-historical-result')).toBeTruthy());
    expect(screen.getByTestId('dhan-historical-empty')).toBeTruthy();
    expect(screen.getByTestId('dhan-historical-empty').textContent).toContain('not a failure');
    expect(screen.queryByTestId('dhan-historical-failure')).toBeNull();
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
