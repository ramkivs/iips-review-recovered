/**
 * W-31 — typed API client for the watchlist sourced-price surface.
 *
 * Mirrors the server contract 1:1 — no derivation, no transformation.
 * Each watchlist item is enriched with a W-29 quote-consumption entry carrying
 * LTP, change, freshness and explicit unresolved/unavailable state. A missing
 * price is never a zero.
 */

import { noAuthFetch } from '../core/network/noAuthFetch';

export type WatchlistQuoteOutcome =
  | 'CURRENT'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'UNMAPPED'
  | 'MALFORMED_IDENTITY';

export interface WatchlistQuoteValue {
  readonly companyId: string;
  readonly symbol: string;
  readonly exchange: string;
  readonly currency: string;
  readonly ltp: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly previousClose: number;
  readonly volume: number;
  readonly change: number;
  readonly pctChange: number;
  readonly bid: number | null;
  readonly ask: number | null;
  readonly vwap?: number;
  readonly turnover?: number;
  readonly tradeCount?: number;
}

export interface WatchlistQuoteEntry {
  readonly outcome: WatchlistQuoteOutcome;
  readonly request: {
    readonly companyId: string | null;
    readonly securityId: string | null;
    readonly exchangeSegment: 'NSE_EQ' | 'BSE_EQ' | null;
  };
  readonly securityId: string | null;
  readonly value: WatchlistQuoteValue | null;
  readonly asOf: string | null;
  readonly receivedAt: string | null;
  readonly evaluatedAt: string | null;
  readonly qualityState: string | null;
  readonly freshness: 'SNAPSHOT' | 'STALE' | 'UNAVAILABLE' | 'LIVE';
  readonly freshnessVerdict: string | null;
  readonly providerQualification: string;
  readonly unmapped: { readonly code: string; readonly message: string } | null;
  readonly unavailable: {
    readonly code: string;
    readonly message: string;
    readonly connectionAttempted: boolean;
    readonly notAttempted: boolean;
  } | null;
  readonly malformedIdentity: { readonly code: string; readonly reason: string } | null;
  readonly provenance: {
    readonly sourceClassification: string | null;
    readonly dataVersion: string | null;
    readonly lineageHash: string | null;
    readonly vendorTier: string | null;
  } | null;
  readonly freshnessStatus: {
    readonly verdict: string;
    readonly cacheState: string;
    readonly ageSeconds: number | null;
  } | null;
  readonly freshnessStatusFailure: { readonly code: string; readonly message: string } | null;
}

export interface WatchlistQuotesSummary {
  readonly requestedCount: number;
  readonly pricedCount: number;
  readonly counts: Readonly<Record<WatchlistQuoteOutcome, number>>;
  readonly worstFreshness: string;
  readonly providerQualification: string;
  readonly transportConfigured: boolean;
  readonly transportFailureCode: string | null;
  readonly rateLimited: boolean;
  readonly concurrency: number;
}

export interface WatchlistQuotesView {
  readonly watchlistId: string;
  readonly name: string;
  readonly createdAt: string;
  readonly totalItems: number;
  readonly quotes: readonly WatchlistQuoteEntry[];
  readonly summary: WatchlistQuotesSummary;
}

export interface WatchlistQuotesEnvelope {
  readonly data: WatchlistQuotesView;
}

export async function fetchWatchlistQuotes(
  watchlistId: string,
  baseUrl = '',
): Promise<WatchlistQuotesEnvelope> {
  const url = `${baseUrl}/api/watchlists/${encodeURIComponent(watchlistId)}/quotes`;
  const res = await noAuthFetch(url);
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string; detail?: unknown };
      if (typeof body.error === 'string') detail = ` (${body.error})`;
    } catch {
      // status remains the signal
    }
    throw new Error(`watchlist quotes request failed: ${res.status}${detail}`);
  }
  return (await res.json()) as WatchlistQuotesEnvelope;
}
