/**
 * UI07 Watchlists HTTP boundary.
 *
 * The existing watchlist service, persistence, governed-universe contracts, and validation remain
 * intact and unmodified. The HTTP capability now establishes its owner context from the
 * server-owned owner-context resolver (the governed carrier mechanism, F-3) and completes the
 * governed-universe integration the existing add-item and governed-row behaviour already requires:
 * item values are resolved SERVER-SIDE from the governed universe and the client only ever selects
 * a row by `canonicalSecurityId`.
 *
 * No identity is inferred, none is read from a request, and the owner identity itself is not
 * disclosed to the client (it carries partition semantics only; the UI07 contract does not declare
 * it). Nothing here invents governed values, market data, history or time series.
 *
 * FAIL-CLOSED CONTRACT (unchanged in force)
 *   Known paths/methods with no valid owner context answer the existing explicit
 *   `503 owner-context-unavailable`; unknown paths/methods retain the existing 404 behaviour.
 *   With no carrier configured this transport behaves exactly as before.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable';
import { resolveOwnerContext, type OwnerContext } from '../owner-context-resolver';
import { readJsonBody, sendGovernedDependencyUnavailable, sendJson } from '../owner-scoped-http';
import {
  WatchlistValidationError,
  addItem,
  createWatchlist,
  deleteWatchlist,
  evaluateItem,
  listWatchlists,
  readWatchlist,
  removeItem,
  type Watchlist,
  type WatchlistItem,
} from './watchlists-service';

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

/** Disclosed transport semantics for the UI07 provenance surface. */
export const TRANSPORT_SEMANTICS =
  'PRIVATE, owner-scoped watchlists (append-only journal). Tenant and owner are established ' +
  'server-side by the server-owned owner context; the client supplies no identity. Item values are ' +
  'resolved server-side from the governed universe. Deltas compare each item PERSISTED BASELINE ' +
  'against the CURRENT governed value and are NOT a time series.';

/** Composition-supplied governed universe provider (see `executive-transport`). */
export interface WatchlistsTransportDeps {
  readonly universe?: GovernedUniverseProvider;
}

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

/** Index the governed universe by the certified identity the UI07 contract stores. */
async function governedRowIndex(
  universe: GovernedUniverseProvider,
  tenantId: string,
): Promise<ReadonlyMap<string, GovernedRow>> {
  const rows = await universe.securities(tenantId);
  const index = new Map<string, GovernedRow>();
  for (const row of rows) {
    const id = row.canonicalSecurityId;
    if (typeof id === 'string' && id.length > 0) index.set(id, row);
  }
  return index;
}

function provenance(vintage: {
  asOf: string;
  dataVersion: string;
  mode: string;
  dataSource: string;
}): Record<string, unknown> {
  return {
    dataSource: vintage.dataSource,
    asOf: vintage.asOf,
    dataVersion: vintage.dataVersion,
    mode: vintage.mode,
    freshness: 'SNAPSHOT',
    authority: 'PLATFORM',
    transportSemantics: TRANSPORT_SEMANTICS,
  };
}

/**
 * Project one item: `evaluateItem` supplies the baseline-vs-current deltas and trigger results, and
 * the current governed row is passed through verbatim (never re-derived). A row that is absent from
 * the governed universe yields `current: null` and unavailable values — `evaluateItem`'s own
 * discipline, which never fires a trigger on missing data.
 */
function itemView(item: WatchlistItem, current: GovernedRow | undefined): Record<string, unknown> {
  const evaluated = evaluateItem(item, current, TRACKED_FIELDS);
  return {
    canonicalSecurityId: item.canonicalSecurityId,
    baseline: item.baseline,
    baselineAsOf: item.baselineAsOf,
    addedAt: item.addedAt,
    triggers: evaluated.triggers,
    deltas: evaluated.deltas,
    current: current ?? null,
    currentAsOf: evaluated.currentAsOf,
    ...(current !== undefined && typeof current.quality === 'string' ? { _quality: current.quality } : {}),
  };
}

/** Project one list into the UI07 client contract declared by `frontend/src/api/watchlists.ts`. */
function listView(
  list: Watchlist,
  index: ReadonlyMap<string, GovernedRow>,
): Record<string, unknown> {
  const items = list.items.map((item) => itemView(item, index.get(item.canonicalSecurityId)));
  return {
    surfaceName: 'UI07',
    disposition: 'NEW',
    watchlistId: list.watchlistId,
    name: list.name,
    createdAt: list.createdAt,
    totalItems: items.length,
    items,
  };
}

/** Map a service validation failure onto its HTTP status. Nothing is coerced or reworded. */
function statusForValidation(message: string): number {
  if (message === 'watchlist-exists') return 409;
  if (message.endsWith('-not-found')) return 404;
  return 400;
}

async function dispatch(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  path: string,
  method: string,
  owner: OwnerContext,
  universe: GovernedUniverseProvider,
): Promise<void> {
  const { tenantId, ownerUserId } = owner;
  const parts = path.split('/').filter(Boolean);
  const index = await governedRowIndex(universe, tenantId);
  const vintage = await universe.vintage(tenantId);

  if (path === '/api/watchlists' && method === 'GET') {
    sendJson(res, 200, {
      data: listWatchlists(tenantId, ownerUserId).map((l) => listView(l, index)),
      provenance: provenance(vintage),
    });
    return;
  }

  if (path === '/api/watchlists' && method === 'POST') {
    const body = await readJsonBody(req);
    if (!body.ok) {
      sendJson(res, body.status, { error: body.error });
      return;
    }
    const input = (body.value ?? {}) as { watchlistId?: unknown; name?: unknown };
    const list = createWatchlist(tenantId, ownerUserId, input.watchlistId, input.name);
    sendJson(res, 201, { data: listView(list, index) });
    return;
  }

  // Decoded only after `isKnownRoute` has bounded the shape; a malformed segment names no resource.
  let watchlistId: string | null = null;
  try {
    watchlistId = decodeURIComponent(parts[2]);
  } catch {
    watchlistId = null;
  }
  if (parts.length >= 3 && watchlistId === null) {
    sendJson(res, 404, { error: 'watchlist-not-found' });
    return;
  }

  if (watchlistId !== null && parts.length === 3 && method === 'GET') {
    const list = readWatchlist(tenantId, ownerUserId, watchlistId);
    if (!list) {
      sendJson(res, 404, { error: 'watchlist-not-found' });
      return;
    }
    sendJson(res, 200, { data: listView(list, index), provenance: provenance(vintage) });
    return;
  }

  if (watchlistId !== null && parts.length === 3 && method === 'DELETE') {
    if (!deleteWatchlist(tenantId, ownerUserId, watchlistId)) {
      sendJson(res, 404, { error: 'watchlist-not-found' });
      return;
    }
    sendJson(res, 200, { data: { watchlistId, deleted: true } });
    return;
  }

  if (watchlistId !== null && parts.length === 4 && method === 'POST') {
    const body = await readJsonBody(req);
    if (!body.ok) {
      sendJson(res, body.status, { error: body.error });
      return;
    }
    const input = (body.value ?? {}) as { canonicalSecurityId?: unknown; triggers?: unknown };
    const canonicalSecurityId = input.canonicalSecurityId;
    // The client selects a row; it never supplies governed values. An unselected row is not invented.
    const row =
      typeof canonicalSecurityId === 'string' ? index.get(canonicalSecurityId) : undefined;
    if (row === undefined) {
      sendJson(res, 404, { error: 'governed-row-not-found' });
      return;
    }
    const list = addItem(tenantId, ownerUserId, watchlistId, row, input.triggers);
    const added = list.items.find((i) => i.canonicalSecurityId === canonicalSecurityId);
    sendJson(res, 201, {
      data: added ? itemView(added, row) : null,
      watchlistId: list.watchlistId,
    });
    return;
  }

  if (watchlistId !== null && parts.length === 5 && method === 'DELETE') {
    let canonicalSecurityId: string | null = null;
    try {
      canonicalSecurityId = decodeURIComponent(parts[4]);
    } catch {
      canonicalSecurityId = null;
    }
    if (
      canonicalSecurityId === null ||
      !removeItem(tenantId, ownerUserId, watchlistId, canonicalSecurityId)
    ) {
      sendJson(res, 404, { error: 'watchlist-item-not-found' });
      return;
    }
    sendJson(res, 200, { data: { watchlistId, canonicalSecurityId, deleted: true } });
    return;
  }

  // Unreachable while `isKnownRoute` is the dispatch authority for known paths.
  sendJson(res, 404, { error: 'watchlist-not-found' });
}

/** Owner-scoped route handler; valid operations require an established owner context. */
export async function handleWatchlistsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: WatchlistsTransportDeps = {},
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  if (!isWatchlistPath(path) || !isKnownRoute(path, method)) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'watchlist-not-found' }));
    return;
  }

  const owner = resolveOwnerContext();
  if (owner === null) {
    respondOwnerContextUnavailable(res);
    return;
  }

  const universe = deps.universe;
  if (universe === undefined) {
    sendGovernedDependencyUnavailable(res);
    return;
  }

  try {
    await dispatch(req, res, path, method, owner, universe);
  } catch (e) {
    if (e instanceof WatchlistValidationError) {
      sendJson(res, statusForValidation(e.message), { error: e.message });
      return;
    }
    sendJson(res, 500, { error: 'watchlists-transport-error' });
  }
}
