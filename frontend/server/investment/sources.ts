/**
 * IID-1 — the read-only observation sources the coverage view consumes.
 *
 * Three surfaces, all consumed through interfaces that already exist:
 *   1. G3 holdings      — `IpcUserPortfolioPort` (the established same-host IPC read path; no second
 *                          data access mechanism, no store opened, no write capability used);
 *   2. watchlist items  — the existing watchlists service (`listWatchlists`);
 *   3. broker-import preview rows — evaluated from the rows the client holds
 *                          (`POST /api/investment/coverage/preview`); nothing is persisted.
 *
 * Every provider is READ-ONLY and fails loudly. A surface that cannot be read raises, and the transport
 * turns that into a 503 naming the surface, because a coverage total that silently omits a surface would
 * be a wrong total.
 */
import { IpcUserPortfolioPort } from '../user-portfolio/ipcPortAdapter.js';
import {
  isOwnerContextEstablished,
  ownerContextFromBinding,
  readBindingPrecondition,
} from '../user-portfolio/ownerContextFromBinding.js';
import type { G2HoldingView, G2PortfolioSummary } from '../user-portfolio/userPortfolioContract.js';
import type { G2Scope } from '../user-portfolio/userPortfolioPort.js';
import { listWatchlists, type Watchlist } from '../watchlists/watchlists-service.js';
import { resolveOwnerContext } from '../owner-context-resolver.js';
// One import into IRR: the platform own its file layout and exposes only these adapters.
import {
  financialCoverageFromLocalDataset,
  investmentCoverageFromLocalDataset,
  loadRuntimeIdentitySources,
} from '../../../iips-platform/src/investment/identity/runtime';
import { parseSecurityId } from '../../../iips-platform/src/investment/contracts/ids';
import { projectD114SecurityIdentity } from '../../../iips-platform/src/investment/identity/d114Projection';
import type { IdentityObservation } from '../../../iips-platform/src/investment/identity/types';
import type { FinancialCoverageDisclosure } from '../../../iips-platform/src/investment/identity/coverage';
import type { CoverageTransportProviders } from './coverage-transport.js';

export interface SerialisedRaw {
  readonly [key: string]: string | number | boolean | null;
}

/**
 * Extract the effective ISIN from a G2 holding view without fabricating defaults or resolving conflicts.
 * Returns `null` when absent, explicitly unresolved (`securityIdentity === null`), or rejected as malformed/conflicting.
 */
export function effectiveHoldingIsin(holding: G2HoldingView): string | null {
  const projected = projectD114SecurityIdentity({
    securityIdentity: holding.securityIdentity,
    flatIsin: holding.isin,
  });
  return projected.isin;
}

/** A G3 holding row becomes an observation. Nothing is inferred: empty fields stay null. */
export function toHoldingObservation(
  portfolioId: string,
  holding: G2HoldingView,
  index: number,
): IdentityObservation {
  const projected = projectD114SecurityIdentity({
    securityIdentity: holding.securityIdentity,
    flatIsin: holding.isin,
  });

  const raw: Record<string, string | number | boolean | null> = {
    symbol: holding.symbol,
    companyId: holding.companyId,
    quantity: holding.quantity,
    active: holding.active,
    sourceBroker: holding.sourceBroker,
  };
  if (holding.isin !== undefined) raw.isin = holding.isin;
  if (holding.exchange !== undefined) raw.exchange = holding.exchange;
  if (holding.identityStatus !== undefined) raw.identityStatus = holding.identityStatus;
  if (holding.resolutionDisposition !== undefined) raw.resolutionDisposition = holding.resolutionDisposition;
  if (projected.kind === 'populated' && projected.securityIdentity) {
    raw['securityIdentity.securityId'] = projected.securityIdentity.securityId;
    raw['securityIdentity.isin'] = projected.securityIdentity.isin;
    raw['securityIdentity.series'] = projected.securityIdentity.series;
    raw['securityIdentity.isinAuthority'] = projected.securityIdentity.isinAuthority;
  } else if (projected.kind === 'unresolved_null') {
    raw.securityIdentity = null;
  } else if (projected.kind === 'rejected') {
    raw.securityIdentityMalformed = true;
  }

  return {
    observationId: `holding:${portfolioId}:${String(index + 1).padStart(4, '0')}`,
    source: 'HOLDING',
    portfolioId,
    isin: projected.isin,
    symbol: holding.symbol === '' ? null : holding.symbol,
    exchange: holding.exchange ?? null,
    series: projected.series,
    cin: null,
    // IPD's companyId is a lookup hint at most; the resolver never treats it as proof of identity.
    companyIdHint: holding.companyId === '' ? null : holding.companyId,
    ...(projected.rejection !== null ? { securityIdentityRejection: projected.rejection } : {}),
    ...(projected.securityIdentity !== undefined ? { securityIdentity: projected.securityIdentity } : {}),
    displayName: null,
    quantity: Number.isFinite(holding.quantity) ? holding.quantity : null,
    upstreamStatus: holding.identityStatus ?? null,
    raw,
  };
}

/** A watchlist item becomes an observation. `canonicalSecurityId` is used only if it parses as one. */
export function toWatchlistObservation(
  list: Watchlist,
  itemIndex: number,
): IdentityObservation {
  const item = list.items[itemIndex]!;
  let isin: string | null = null;
  try {
    const securityId = parseSecurityId(item.canonicalSecurityId);
    isin = securityId.slice('IN:ISIN:'.length);
  } catch {
    isin = null;
  }
  const baseline = item.baseline as Readonly<Record<string, unknown>>;
  const baselineInstrument =
    typeof baseline.instrumentType === 'string' ? baseline.instrumentType : null;
  return {
    observationId: `watchlist:${list.watchlistId}:${String(itemIndex + 1).padStart(4, '0')}`,
    source: 'WATCHLIST',
    portfolioId: null,
    isin,
    symbol: null,
    exchange: null,
    series: null,
    cin: null,
    companyIdHint: isin === null ? item.canonicalSecurityId : null,
    displayName: null,
    quantity: null,
    upstreamStatus: baselineInstrument,
    raw: {
      canonicalSecurityId: item.canonicalSecurityId,
      watchlistId: list.watchlistId,
      baselineAsOf: item.baselineAsOf,
      addedAt: item.addedAt,
    },
  };
}

export interface CoverageSourceOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly portFactory?: () => IpcUserPortfolioPort;
  readonly watchlistsFactory?: () => readonly Watchlist[];
  /** Data-domain root for the IID-0 dataset used only to disclose financial coverage. */
  readonly dataRoot?: string;
}

/** Read-only G3 holdings via the existing IPC port. */
export function createHoldingsProvider(options: CoverageSourceOptions = {}) {
  return async (): Promise<readonly IdentityObservation[]> => {
    const env = options.env ?? process.env;
    const precondition = readBindingPrecondition(env);
    if (!isOwnerContextEstablished(ownerContextFromBinding(precondition, env))) {
      throw new Error('owner context not established: the server-owned binding carrier is not configured');
    }
    const port = options.portFactory?.() ?? new IpcUserPortfolioPort({ precondition });
    // An empty scope is intentional: IPD resolves the owner from its own active binding.
    const scope: G2Scope = {};
    const summaries: readonly G2PortfolioSummary[] = await port.listPortfolios({ scope });
    const observations: IdentityObservation[] = [];
    for (const summary of summaries) {
      const view = await port.getPortfolio({ scope, portfolioId: summary.portfolioId });
      view.holdings.forEach((holding, index) => {
        observations.push(toHoldingObservation(summary.portfolioId, holding, index));
      });
    }
    return observations;
  };
}

/**
 * IID WI-2 (P3) — read-only holdings for ONE portfolio, through the SAME IPC path and the SAME server-owned
 * binding precondition the coverage holdings provider uses.
 *
 * This exists so holding identity can be resolved without reading dispositions. It does not widen access: an
 * unestablished owner context throws before the port is constructed, and the scope stays empty so IPD resolves
 * the owner from its own active binding. No write capability is used.
 */
export function createPortfolioHoldingsProvider(options: CoverageSourceOptions = {}) {
  return async (portfolioId: string): Promise<readonly G2HoldingView[]> => {
    const env = options.env ?? process.env;
    const precondition = readBindingPrecondition(env);
    if (!isOwnerContextEstablished(ownerContextFromBinding(precondition, env))) {
      throw new Error('owner context not established: the server-owned binding carrier is not configured');
    }
    const port = options.portFactory?.() ?? new IpcUserPortfolioPort({ precondition });
    const scope: G2Scope = {};
    const view = await port.getPortfolio({ scope, portfolioId });
    return view.holdings;
  };
}

/** Read-only watchlist items via the existing watchlists service. */
export function createWatchlistProvider(options: CoverageSourceOptions = {}) {
  return async (): Promise<readonly IdentityObservation[]> => {
    const owner = resolveOwnerContext(options.env ?? process.env);
    if (owner === null) {
      throw new Error('owner context not established: the server-owned binding carrier is not configured');
    }
    const lists = options.watchlistsFactory?.() ?? listWatchlists(owner.tenantId, owner.ownerUserId);
    const observations: IdentityObservation[] = [];
    for (const list of lists) {
      for (let index = 0; index < list.items.length; index += 1) {
        observations.push(toWatchlistObservation(list, index));
      }
    }
    return observations;
  };
}

/**
 * Disclose the IID-0 position from the served dataset. The platform performs the read through its own
 * port; an absent dataset is disclosed as `NONE`, which is the truthful answer.
 */
export function createFinancialCoverageProvider(
  options: CoverageSourceOptions = {},
): () => FinancialCoverageDisclosure {
  return () => financialCoverageFromLocalDataset(options.dataRoot);
}

/** Assemble the transport providers from the existing read-only surfaces. */
export function createCoverageProviders(options: CoverageSourceOptions = {}): CoverageTransportProviders {
  return {
    holdings: createHoldingsProvider(options),
    watchlist: createWatchlistProvider(options),
    loadSources: () => loadRuntimeIdentitySources(options.dataRoot),
    financialCoverage: createFinancialCoverageProvider(options),
    readInvestmentCoverage: (asOf) => investmentCoverageFromLocalDataset(asOf, options.dataRoot),
    dataRoot: options.dataRoot,
  };
}
