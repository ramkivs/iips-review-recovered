/**
 * W-31 — Watchlists sourced price display.
 *
 * WHAT THIS MODULE IS
 *   The watchlist consumer of W-29's shared quote-consumption boundary. For a watchlist it
 *   maps each persisted item to a canonical quote identity, fetches all quotes through the
 *   ONE boundary (`consumeQuotes`) under bounded concurrency, and returns one uniform
 *   projection per item carrying LTP, price change, freshness and the explicit
 *   UNMAPPED / UNAVAILABLE / MALFORMED_IDENTITY states.
 *
 *   - ONE `consumeQuotes` call per watchlist, not one per item. A 200-item watchlist never
 *     becomes a 200-request burst; the worker pool (default 4, ceiling 8) is the only
 *     concurrency control, and W-29's rate-limit awareness stops further dispatch on
 *     RATE_LIMITED with explicit `notAttempted` entries.
 *   - Ordering is preserved: quotes[i] answers watchlist.items[i]. The batch is returned in
 *     request order, independent of completion order.
 *   - Unresolved items (non-D114 canonicalSecurityId, or provider-side UNRESOLVED_INSTRUMENT)
 *     are never rendered as zero: `value` is null and `outcome` is UNMAPPED or MALFORMED_IDENTITY.
 *   - Stale prices are never presented as current: the joined freshness (`freshness: 'STALE'`)
 *     is carried per identity and the UI must badge it as stale.
 *
 * WHAT THIS MODULE IS NOT
 *   - NOT a provider client, normalizer, cache or freshness evaluator. Those stay in IPD and
 *     inside W-29's boundary.
 *   - NOT a membership or history implementation. Names, membership and baseline deltas stay
 *     in `watchlists-service` / `watchlists-transport` unchanged.
 *   - NOT a portfolio valuation or company-analysis feature (out of scope).
 *
 * SERVER-SIDE ONLY — never imported from `frontend/src`.
 */

import type http from 'node:http';
import { resolveOwnerContext, type OwnerContext } from '../owner-context-resolver';
import { sendJson, respondOwnerContextUnavailableUncached } from '../owner-scoped-http';
import {
  readWatchlist,
  type Watchlist,
  type WatchlistItem,
} from './watchlists-service';
import {
  consumeQuotes,
  DEFAULT_QUOTE_BATCH_CONCURRENCY,
  MAX_QUOTE_BATCH_CONCURRENCY,
  type QuoteConsumptionBatch,
  type QuoteConsumptionDeps,
  type QuoteConsumptionEntry,
} from '../market-data/quoteConsumptionBoundary';
import type { Freshness } from '../market-data/dhanFreshnessRoutes';

/** The watchlist-quotes route pattern: GET /api/watchlists/:watchlistId/quotes */
export const WATCHLIST_QUOTES_PATH_PATTERN = /^\/api\/watchlists\/[^/]+\/quotes$/;

/** Bounded concurrency for watchlist quote batches — same bounds as W-29. */
export const WATCHLIST_QUOTES_DEFAULT_CONCURRENCY = DEFAULT_QUOTE_BATCH_CONCURRENCY;
export const WATCHLIST_QUOTES_MAX_CONCURRENCY = MAX_QUOTE_BATCH_CONCURRENCY;

/**
 * Dependency seam for watchlist quote enrichment.
 *
 * `store` and universe injection are not needed here: the watchlist is already resolved by
 * the HTTP layer. The only injectable concerns are the quote-consumption transport (for
 * synthetic fixtures) and the bounded concurrency.
 */
export interface WatchlistQuotesDeps extends QuoteConsumptionDeps {
  /** Override concurrency for this watchlist batch. Clamped to [1, MAX]. */
  readonly concurrency?: number;
}

/**
 * The enriched view for one watchlist item: its canonical identifier, its position in
 * the list, and the sourced quote projection for that identity.
 *
 * `position` preserves the list's ordering explicitly so a consumer that reorders or
 * filters does not lose correlation; the array itself is already in watchlist order.
 */
export interface WatchlistQuoteItem {
  readonly canonicalSecurityId: string;
  readonly position: number;
  readonly quote: QuoteConsumptionEntry;
}

/**
 * The response payload for GET /api/watchlists/:watchlistId/quotes.
 *
 * `quotes` is one entry per watchlist item, in watchlist order. A failed item carries
 * `value: null` and an explicit outcome — never a zero. `summary` is the W-29 batch
 * summary for the list-level label (worst freshness, rate-limited, counts).
 */
export interface WatchlistQuotesView {
  readonly watchlistId: string;
  readonly name: string;
  readonly createdAt: string;
  readonly totalItems: number;
  readonly quotes: readonly QuoteConsumptionEntry[];
  readonly summary: {
    readonly requestedCount: number;
    readonly pricedCount: number;
    readonly counts: Readonly<Record<string, number>>;
    readonly worstFreshness: Freshness;
    readonly providerQualification: string;
    readonly transportConfigured: boolean;
    readonly transportFailureCode: string | null;
    readonly rateLimited: boolean;
    readonly concurrency: number;
  };
}

/**
 * Maps one persisted watchlist item to a W-29 quote-consumption identity.
 *
 * The watchlist stores the certified `canonicalSecurityId` (today a sector identifier like
 * "Technology", tomorrow potentially a D114 identity like "ISIN:INE002A01018:EQ"). The
 * mapping is intentionally narrow and truthful:
 *
 *   - `securityId` is the stored `canonicalSecurityId` verbatim — never reinterpreted,
 *     never split, never mapped through a security master. If it is not a canonical D114
 *     identity, W-29 will return MALFORMED_IDENTITY and no provider request is issued.
 *   - `companyId` is the governed `baseline.companyId` when present (the certified company
 *     identity the baseline was captured with), otherwise the stored canonicalSecurityId
 *     itself. W-29 requires a non-empty companyId; falling back to the identifier satisfies
 *     that without inventing a company.
 *   - `exchangeSegment` is taken from `baseline.exchangeSegment` or `baseline.exchange`
 *     when the baseline carries it (e.g. a future ISIN-bearing governed row), otherwise
 *     omitted and W-29 defaults it to NSE_EQ. No exchange is guessed.
 *
 * This preserves existing membership behaviour: a watchlist that contains only sector
 * identifiers will have every item resolve to MALFORMED_IDENTITY (truthfully unresolved),
 * and a watchlist that contains D114 identities will have those quoted through W-29.
 * Ordering is the caller's responsibility — this function does not reorder.
 */
export function watchlistItemToQuoteIdentity(item: WatchlistItem): {
  readonly companyId: string;
  readonly securityId: string;
  readonly exchangeSegment?: string;
} {
  const baseline = item.baseline as Readonly<Record<string, unknown>>;
  const rawCompanyId = typeof baseline.companyId === 'string' ? baseline.companyId.trim() : '';
  const companyId = rawCompanyId !== '' ? rawCompanyId : item.canonicalSecurityId;

  let exchangeSegment: string | undefined;
  if (typeof baseline.exchangeSegment === 'string' && baseline.exchangeSegment.trim() !== '') {
    exchangeSegment = baseline.exchangeSegment.trim();
  } else if (typeof baseline.exchange === 'string' && baseline.exchange.trim() !== '') {
    const ex = baseline.exchange.trim().toUpperCase();
    if (ex === 'NSE' || ex === 'NSE_EQ') exchangeSegment = 'NSE_EQ';
    else if (ex === 'BSE' || ex === 'BSE_EQ') exchangeSegment = 'BSE_EQ';
    // Any other exchange value is ignored — W-29 will validate and it will default.
  }

  return {
    companyId,
    securityId: item.canonicalSecurityId,
    ...(exchangeSegment ? { exchangeSegment } : {}),
  };
}

/**
 * Maps an entire watchlist's items to W-29 identities, preserving order.
 *
 * The returned array has the same length and order as `watchlist.items`; index i answers
 * watchlist.items[i]. This is what is passed directly to `consumeQuotes`.
 */
export function watchlistItemsToQuoteIdentities(watchlist: Watchlist): readonly unknown[] {
  return watchlist.items.map((item) => watchlistItemToQuoteIdentity(item));
}

/**
 * Enriches a watchlist's items with sourced quotes through W-29's boundary.
 *
 * This is the direct consumer of `consumeQuotes` for watchlists: it performs ONE bounded
 * batch fetch for the whole list, not one per item, and returns the batch with per-item
 * freshness and the batch-level summary. No caching, no normalization, no second client.
 *
 * @param watchlist — the already-resolved watchlist (owner-scoped, from `readWatchlist`).
 * @param deps — optional transport/concurrency injection for tests.
 */
export async function enrichWatchlistWithQuotes(
  watchlist: Watchlist,
  deps: WatchlistQuotesDeps = {},
): Promise<QuoteConsumptionBatch> {
  const identities = watchlistItemsToQuoteIdentities(watchlist);
  // An empty watchlist still yields a batch (W-29: worstFreshness UNAVAILABLE, all counts 0)
  // so the UI has a stable shape — no special casing, no invented price.
  return consumeQuotes(identities, deps);
}

/**
 * Projects a watchlist and its quote batch into the HTTP view.
 *
 * The view carries the list's own name/createdAt (unchanged) and the quotes in watchlist
 * order, plus the batch summary for a list-level freshness label. The watchlist's
 * persistence ordering is preserved verbatim — the view does not sort, deduplicate or
 * coalesce, so a UI receives items exactly as the member ordered them.
 */
export function projectWatchlistQuotesView(
  watchlist: Watchlist,
  batch: QuoteConsumptionBatch,
): WatchlistQuotesView {
  return {
    watchlistId: watchlist.watchlistId,
    name: watchlist.name,
    createdAt: watchlist.createdAt,
    totalItems: watchlist.items.length,
    quotes: batch.entries,
    summary: {
      requestedCount: batch.requestedCount,
      pricedCount: batch.pricedCount,
      counts: batch.counts,
      worstFreshness: batch.worstFreshness,
      providerQualification: batch.providerQualification,
      transportConfigured: batch.transportConfigured,
      transportFailureCode: batch.transportFailureCode,
      rateLimited: batch.rateLimited,
      concurrency: batch.concurrency,
    },
  };
}

// ── HTTP boundary ───────────────────────────────────────────────────────────────

function isWatchlistQuotesRequest(path: string, method: string): boolean {
  return method === 'GET' && WATCHLIST_QUOTES_PATH_PATTERN.test(path);
}

export function isWatchlistQuotesPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return WATCHLIST_QUOTES_PATH_PATTERN.test(path);
}

/**
 * HTTP handler for GET /api/watchlists/:watchlistId/quotes
 *
 * Owner-scoped, fail-closed:
 *   - 503 when no valid owner context (unknown paths remain 404)
 *   - 404 when the watchlist does not exist for this owner
 *   - 200 with the enriched view otherwise, including explicit unresolved/unavailable
 *     states for each item. A missing price is never a zero.
 *
 * The handler performs exactly one `consumeQuotes` call for the whole watchlist, under
 * bounded concurrency (default 4, ceiling 8). It respects W-29's rate-limit behaviour:
 * a RATE_LIMITED answer stops further dispatch and remaining items are marked
 * `notAttempted: true` with no value.
 */
export async function handleWatchlistQuotesRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: WatchlistQuotesDeps = {},
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';

  if (!isWatchlistQuotesRequest(path, method)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'watchlist-not-found' }));
    return;
  }

  const owner = resolveOwnerContext();
  if (owner === null) {
    respondOwnerContextUnavailableUncached(res);
    return;
  }

  // Extract watchlistId: /api/watchlists/:watchlistId/quotes
  const parts = path.split('/').filter(Boolean);
  // parts = ['api','watchlists','<id>','quotes']
  let watchlistId: string | null = null;
  try {
    watchlistId = parts[2] ? decodeURIComponent(parts[2]) : null;
  } catch {
    watchlistId = null;
  }
  if (watchlistId === null || watchlistId.trim() === '') {
    sendJson(res, 404, { error: 'watchlist-not-found' });
    return;
  }

  const watchlist = readWatchlist(owner.tenantId, owner.ownerUserId, watchlistId);
  if (!watchlist) {
    sendJson(res, 404, { error: 'watchlist-not-found' });
    return;
  }

  try {
    const batch = await enrichWatchlistWithQuotes(watchlist, deps);
    const view = projectWatchlistQuotesView(watchlist, batch);
    sendJson(res, 200, { data: view });
  } catch (e) {
    sendJson(res, 500, { error: 'watchlists-quotes-error', detail: String(e) });
  }
}
