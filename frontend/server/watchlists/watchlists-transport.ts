/**
 * UI07 Watchlists HTTP boundary.
 *
 * The existing watchlist service, persistence, governed-universe contracts, and validation remain
 * intact. HTTP data operations are owner-scoped and stay unavailable until a non-authentication
 * ownership source is separately authorized and established. No identity is inferred and no data
 * is read or changed through this transport.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable';

export interface GovernedRow {
  readonly [field: string]: unknown;
}

export interface GovernedUniverseProvider {
  screenerUniverse(tenantId: string): Promise<readonly GovernedRow[]>;
  searchUniverse(tenantId: string): Promise<readonly GovernedRow[]>;
  securities(tenantId: string): Promise<readonly GovernedRow[]>;
  vintage(tenantId: string): Promise<{
    asOf: string;
    dataVersion: string;
    mode: string;
    dataSource: string;
    classification: string;
    contributingSnapshotIds: readonly string[];
  }>;
}

/** Governed numeric fields compared between baseline and current. */
export const TRACKED_FIELDS = Object.freeze(['composite', 'qualityAxis', 'valuation'] as const);

export function isWatchlistPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/watchlists' || path.startsWith('/api/watchlists/');
}

function isKnownRoute(path: string, method: string): boolean {
  const parts = path.split('/').filter(Boolean);
  if (path === '/api/watchlists') return method === 'GET' || method === 'POST';
  if (parts.length === 3 && parts[0] === 'api' && parts[1] === 'watchlists') {
    return method === 'GET' || method === 'DELETE';
  }
  if (parts.length === 4 && parts[0] === 'api' && parts[1] === 'watchlists' && parts[3] === 'items') {
    return method === 'POST';
  }
  if (
    parts.length === 5 && parts[0] === 'api' && parts[1] === 'watchlists' &&
    parts[3] === 'items'
  ) {
    return method === 'DELETE';
  }
  return false;
}

/** Owner-scoped route handler; valid operations fail closed as unavailable without an owner. */
export async function handleWatchlistsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  if (!isWatchlistPath(path) || !isKnownRoute(path, method)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'watchlist-not-found' }));
    return;
  }

  respondOwnerContextUnavailable(res);
}
