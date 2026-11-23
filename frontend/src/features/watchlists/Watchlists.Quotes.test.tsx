/**
 * W-31 — Watchlists sourced price display: browser rendering.
 *
 * Verifies that a mixed-resolution watchlist renders three distinct states truthfully,
 * that prices are sourced via the client boundary, and that no unresolved price is a zero
 * and stale is never current.
 *
 * Synthetic — fetch is mocked, no live Dhan request.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Watchlists } from './Watchlists';

// Mock the watchlists API (governed lists)
vi.mock('../../api/watchlists', async () => {
  const actual = await vi.importActual<typeof import('../../api/watchlists')>('../../api/watchlists');
  return {
    ...actual,
    fetchWatchlists: vi.fn(),
    createWatchlist: vi.fn(),
    deleteWatchlist: vi.fn(),
    addWatchlistItem: vi.fn(),
    removeWatchlistItem: vi.fn(),
  };
});

// Mock the watchlist quotes API
vi.mock('../../api/watchlistQuotes', async () => {
  const actual = await vi.importActual<typeof import('../../api/watchlistQuotes')>('../../api/watchlistQuotes');
  return {
    ...actual,
    fetchWatchlistQuotes: vi.fn(),
  };
});

import { fetchWatchlists } from '../../api/watchlists';
import { fetchWatchlistQuotes } from '../../api/watchlistQuotes';

const MOCK_WATCHLIST = {
  surfaceName: 'UI07',
  disposition: 'NEW',
  watchlistId: 'wl-mixed',
  name: 'Mixed Watchlist',
  createdAt: '2026-11-01T00:00:00.000Z',
  totalItems: 3,
  items: [
    {
      canonicalSecurityId: 'ISIN:INE002A01018:EQ',
      baseline: { canonicalSecurityId: 'ISIN:INE002A01018:EQ', companyId: 'SYNTH_CURRENT', asOf: '2026-08-09T00:00:00.000Z' },
      baselineAsOf: '2026-08-09T00:00:00.000Z',
      addedAt: '2026-11-01T00:00:01.000Z',
      triggers: [],
      deltas: [{ field: 'composite', baselineValue: 70, currentValue: 70, delta: 0, changed: false }],
      current: null,
      currentAsOf: null,
    },
    {
      canonicalSecurityId: 'Technology',
      baseline: { canonicalSecurityId: 'Technology', companyId: 'Technology-H1', asOf: '2026-08-09T00:00:00.000Z' },
      baselineAsOf: '2026-08-09T00:00:00.000Z',
      addedAt: '2026-11-01T00:00:02.000Z',
      triggers: [],
      deltas: [{ field: 'composite', baselineValue: 72, currentValue: 72, delta: 0, changed: false }],
      current: null,
      currentAsOf: null,
    },
    {
      canonicalSecurityId: 'ISIN:INE467B01029:EQ',
      baseline: { canonicalSecurityId: 'ISIN:INE467B01029:EQ', companyId: 'SYNTH_STALE', asOf: '2026-08-09T00:00:00.000Z' },
      baselineAsOf: '2026-08-09T00:00:00.000Z',
      addedAt: '2026-11-01T00:00:03.000Z',
      triggers: [],
      deltas: [{ field: 'composite', baselineValue: 70, currentValue: 70, delta: 0, changed: false }],
      current: null,
      currentAsOf: null,
    },
  ],
} as unknown as import('../../api/watchlists').WatchlistView;

const MOCK_QUOTES = {
  data: {
    watchlistId: 'wl-mixed',
    name: 'Mixed Watchlist',
    createdAt: '2026-11-01T00:00:00.000Z',
    totalItems: 3,
    quotes: [
      {
        outcome: 'CURRENT',
        request: { companyId: 'SYNTH_CURRENT', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment: 'NSE_EQ' },
        securityId: 'ISIN:INE002A01018:EQ',
        value: { companyId: 'SYNTH_CURRENT', symbol: 'RELIANCE', exchange: 'NSE', currency: 'INR', ltp: 2500.5, open: 2480, high: 2510, low: 2475, previousClose: 2485, volume: 100000, change: 15.5, pctChange: 0.62, bid: 2500, ask: 2501 },
        asOf: '2026-11-06T10:15:00.000Z',
        receivedAt: '2026-11-06T10:15:01.000Z',
        evaluatedAt: '2026-11-06T10:15:02.000Z',
        qualityState: 'GOOD',
        freshness: 'SNAPSHOT',
        freshnessVerdict: 'GOOD',
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        unmapped: null,
        unavailable: null,
        malformedIdentity: null,
        provenance: null,
        freshnessStatus: null,
        freshnessStatusFailure: null,
      },
      {
        outcome: 'MALFORMED_IDENTITY',
        request: { companyId: 'Technology-H1', securityId: 'Technology', exchangeSegment: 'NSE_EQ' },
        securityId: 'Technology',
        value: null,
        asOf: null,
        receivedAt: null,
        evaluatedAt: null,
        qualityState: null,
        freshness: 'UNAVAILABLE',
        freshnessVerdict: null,
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        unmapped: null,
        unavailable: null,
        malformedIdentity: { code: 'MALFORMED_REQUEST', reason: 'The security identity is not a canonical D114 identity (expected ISIN:<isin>:<series>).' },
        provenance: null,
        freshnessStatus: null,
        freshnessStatusFailure: null,
      },
      {
        outcome: 'STALE',
        request: { companyId: 'SYNTH_STALE', securityId: 'ISIN:INE467B01029:EQ', exchangeSegment: 'NSE_EQ' },
        securityId: 'ISIN:INE467B01029:EQ',
        value: { companyId: 'SYNTH_STALE', symbol: 'INFY', exchange: 'NSE', currency: 'INR', ltp: 1450.0, open: 1440, high: 1460, low: 1435, previousClose: 1445, volume: 80000, change: 5.0, pctChange: 0.34, bid: 1449, ask: 1451 },
        asOf: '2026-11-06T06:00:00.000Z',
        receivedAt: '2026-11-06T06:00:01.000Z',
        evaluatedAt: '2026-11-06T06:00:02.000Z',
        qualityState: 'STALE',
        freshness: 'STALE',
        freshnessVerdict: 'STALE',
        providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
        unmapped: null,
        unavailable: null,
        malformedIdentity: null,
        provenance: null,
        freshnessStatus: null,
        freshnessStatusFailure: null,
      },
    ],
    summary: {
      requestedCount: 3,
      pricedCount: 2,
      counts: { CURRENT: 1, STALE: 1, UNAVAILABLE: 0, UNMAPPED: 0, MALFORMED_IDENTITY: 1 },
      worstFreshness: 'UNAVAILABLE',
      providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED',
      transportConfigured: true,
      transportFailureCode: null,
      rateLimited: false,
      concurrency: 4,
    },
  },
} as unknown as import('../../api/watchlistQuotes').WatchlistQuotesEnvelope;

beforeEach(() => {
  vi.mocked(fetchWatchlists).mockResolvedValue({
    data: [MOCK_WATCHLIST],
    provenance: { dataSource: 'governed:certified-v2.0-reference-universe', asOf: '2026-08-09T00:00:00.000Z', dataVersion: 'v1.1-replay-baseline', mode: 'SNAPSHOT', freshness: 'SNAPSHOT', authority: 'PLATFORM', transportSemantics: 'test' },
  });
  vi.mocked(fetchWatchlistQuotes).mockResolvedValue(MOCK_QUOTES);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('W-31 Watchlists market prices — browser', () => {
  it('renders three distinct states: priced, unresolved, stale — all truthful', async () => {
    render(
      <MemoryRouter>
        <Watchlists />
      </MemoryRouter>,
    );

    // Wait for market prices panel to finish loading (one batch per watchlist)
    await waitFor(() => expect(screen.getByTestId('quote-ltp-ISIN:INE002A01018:EQ')).toBeInTheDocument());

    // Priced item: LTP and change present, freshness Current
    const pricedLtp = screen.getByTestId('quote-ltp-ISIN:INE002A01018:EQ');
    expect(pricedLtp.textContent).toBe('2500.5');
    expect(pricedLtp.textContent).not.toBe('0');
    expect(screen.getByTestId('quote-change-ISIN:INE002A01018:EQ').textContent).toContain('15.5');
    expect(screen.getByTestId('quote-freshness-ISIN:INE002A01018:EQ').textContent).toBe('Current');
    expect(screen.getByTestId('quote-status-ISIN:INE002A01018:EQ').textContent).toBe('Priced');

    // Unresolved item: never zero, shown as unresolved
    expect(screen.getByTestId('quote-ltp-Technology').textContent).toBe('—');
    expect(screen.getByTestId('quote-freshness-Technology').textContent).toBe('Unavailable');
    const unresolvedStatus = screen.getByTestId('quote-status-Technology');
    expect(unresolvedStatus.textContent).toContain('Unresolved');
    expect(unresolvedStatus.textContent).toContain('MALFORMED_REQUEST');
    expect(unresolvedStatus.textContent).not.toContain('0');

    // Stale item: has LTP but freshness is Stale (never current)
    expect(screen.getByTestId('quote-ltp-ISIN:INE467B01029:EQ').textContent).toBe('1450');
    expect(screen.getByTestId('quote-freshness-ISIN:INE467B01029:EQ').textContent).toBe('Stale');
    expect(screen.getByTestId('quote-status-ISIN:INE467B01029:EQ').textContent).toContain('Stale');
    expect(screen.getByTestId('quote-freshness-ISIN:INE467B01029:EQ').textContent).not.toBe('Current');

    // Summary reflects mixed batch
    expect(screen.getByTestId('watchlist-quotes-summary-wl-mixed').textContent).toContain('1 current');
    expect(screen.getByTestId('watchlist-quotes-summary-wl-mixed').textContent).toContain('1 stale');

    // No per-item provider storm: ONE fetch per watchlist
    expect(fetchWatchlistQuotes).toHaveBeenCalledTimes(1);
    expect(fetchWatchlistQuotes).toHaveBeenCalledWith('wl-mixed');

    // Ordering preserved: quotes order matches watchlist item order
    const quoteRows = screen.getAllByTestId(/watchlist-quote-row-/);
    expect(quoteRows[0]?.getAttribute('data-testid')).toBe('watchlist-quote-row-ISIN:INE002A01018:EQ');
    expect(quoteRows[1]?.getAttribute('data-testid')).toBe('watchlist-quote-row-Technology');
    expect(quoteRows[2]?.getAttribute('data-testid')).toBe('watchlist-quote-row-ISIN:INE467B01029:EQ');

    // Existing watchlist names and membership unchanged
    expect(screen.getByTestId('watchlist-wl-mixed')).toBeInTheDocument();
    expect(screen.getByText('Mixed Watchlist')).toBeInTheDocument();
    expect(screen.getByTestId('watchlist-item-ISIN:INE002A01018:EQ')).toBeInTheDocument();
    expect(screen.getByTestId('watchlist-item-Technology')).toBeInTheDocument();
  });

  it('shows rate-limited and not-configured states when present', async () => {
    vi.mocked(fetchWatchlistQuotes).mockResolvedValue({
      data: {
        ...MOCK_QUOTES.data,
        summary: { ...MOCK_QUOTES.data.summary, rateLimited: true, transportConfigured: false, transportFailureCode: 'NOT_CONFIGURED' },
      },
    } as unknown as typeof MOCK_QUOTES);
    render(<MemoryRouter><Watchlists /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('watchlist-quotes-wl-mixed')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('watchlist-quotes-rate-limited-wl-mixed')).toBeInTheDocument());
    expect(screen.getByTestId('watchlist-quotes-not-configured-wl-mixed').textContent).toContain('NOT_CONFIGURED');
  });
});
