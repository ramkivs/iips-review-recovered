/**
 * IID WI-2 (P3) — portfolio holding identity, resolved INDEPENDENTLY of dispositions.
 *
 *   GET|HEAD /api/investment/portfolio/:portfolioId/identities
 *
 * THE DEFECT THIS FIXES. `UserPortfolioDetail` derived a holding's issuer from the disposition list
 * (`entry?.issuerId ?? null`). A holding with no recorded disposition — or a disposition read that failed — had
 * no issuer, so its "Company assessment" and "Change history" links vanished. Whether a company can be read has
 * nothing to do with whether a verb has been recorded for it.
 *
 * THE CORRECTION. This surface resolves each holding's identity from the governed roster through the existing
 * `resolveIdentity`, and returns it whether or not any disposition exists. It does not read dispositions at all,
 * so a disposition failure cannot reach it.
 *
 * OWNERSHIP IS NOT WEAKENED. Holdings arrive through the same `IpcUserPortfolioPort` and the same server-owned
 * binding precondition the portfolio detail surface uses. An unestablished owner context is a 503 before any
 * holdings are read; no owner is invented and no cross-owner read is attempted.
 *
 * NO FABRICATION. An unresolved holding is returned with `issuerId: null`, its governed state and its displayable
 * reason. The UI shows that honestly instead of rendering a misleading link. Nothing is classified in the
 * browser, and no issuer id is constructed from a symbol, a name or an IPD company reference.
 *
 * READ-ONLY. No write, no store, no NP-04 artifact, no IPD API change.
 */
import type http from 'node:http';

import { loadRuntimeIdentitySources } from '../../../iips-platform/src/investment/identity/runtime';
import {
  classifyObservationOutcome,
  type D114SecurityIdentity,
  type ObservationOutcomeClass,
} from '../../../iips-platform/src/investment/identity/d114Projection';
import type { SourceLoadResult } from '../../../iips-platform/src/investment/identity/sources';
import { identityInputOf, reasonText, resolveIdentity } from '../../../iips-platform/src/investment/identity/resolver';
import type { IdentityObservation, ResolutionState, UnresolvedReason } from '../../../iips-platform/src/investment/identity/types';
import type { G2HoldingView } from '../user-portfolio/userPortfolioContract.js';
import { toHoldingObservation } from './sources.js';

export const HOLDING_IDENTITY_ROUTES = Object.freeze([
  Object.freeze({
    id: 'portfolio-holding-identities',
    pattern: '/api/investment/portfolio/:portfolioId/identities',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'Governed issuer/security identity per holding, independent of any disposition record.',
  }),
] as const);

export const HOLDING_IDENTITY_ERRORS = Object.freeze({
  methodNotAllowed: Object.freeze({ error: 'method-not-allowed' }),
  invalidRequest: Object.freeze({ error: 'invalid-request' }),
  ownerContextUnavailable: Object.freeze({
    error: 'owner-context-unavailable',
    detail: Object.freeze({ reason: 'The server-owned binding carrier is not configured. No holdings were read.' }),
  }),
  holdingsUnavailable: Object.freeze({
    error: 'holdings-unavailable',
    detail: Object.freeze({ reason: 'The portfolio holdings could not be read. No identity was inferred.' }),
  }),
  identitySourcesUnavailable: Object.freeze({
    error: 'identity-sources-unavailable',
    detail: Object.freeze({
      reason: 'The governed identity files could not be loaded, so no holding identity was resolved.',
    }),
  }),
});

/** One holding's governed identity. `issuerId`/`securityId` are the resolver's own output, or null. */
export interface HoldingIdentity {
  /** Row index in the portfolio view, so the UI can join without re-deriving identity. */
  readonly holdingIndex: number;
  readonly symbol: string;
  readonly isin: string | null;
  readonly series: string | null;
  readonly d114SecurityIdentity: D114SecurityIdentity | null;
  readonly state: ResolutionState;
  readonly outcomeClass: ObservationOutcomeClass;
  readonly issuerId: string | null;
  readonly securityId: string | null;
  readonly listingId: string | null;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly reason: UnresolvedReason | null;
  readonly reasonText: string | null;
  readonly assessable: boolean;
}

export interface HoldingIdentityProviders {
  /** Read-only holdings for ONE portfolio, through the existing IPC path. */
  readonly holdings: (portfolioId: string) => Promise<readonly G2HoldingView[]>;
  readonly loadSources?: () => SourceLoadResult;
  readonly today?: () => string;
}

export function isHoldingIdentityPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return (
    segments.length === 5 &&
    segments[0] === 'api' &&
    segments[1] === 'investment' &&
    segments[2] === 'portfolio' &&
    segments[4] === 'identities'
  );
}

export function parsePortfolioIdOf(url: string | undefined): string | null {
  if (!isHoldingIdentityPath(url)) return null;
  const segments = (url ?? '').split('?')[0]!.split('/').filter((segment) => segment.length > 0);
  try {
    const portfolioId = decodeURIComponent(segments[3]!).trim();
    return portfolioId.length === 0 ? null : portfolioId;
  } catch {
    return null;
  }
}

/**
 * Resolve every holding against the governed sources.
 *
 * `toHoldingObservation` is reused verbatim, so a holding is resolved here by exactly the rules the coverage
 * surface already applies — including treating IPD's `companyId` as a hint that is never proof of identity.
 */
export function resolveHoldingIdentities(
  portfolioId: string,
  holdings: readonly G2HoldingView[],
  sources: Parameters<typeof resolveIdentity>[1]['sources'],
  asOf: string,
): readonly HoldingIdentity[] {
  return holdings.map((holding, index) => {
    const observation: IdentityObservation = toHoldingObservation(portfolioId, holding, index);
    const resolution = resolveIdentity(identityInputOf(observation), { sources, asOf });
    const reason = resolution.failure?.reason ?? null;
    return {
      holdingIndex: index,
      symbol: holding.symbol,
      isin: observation.isin,
      series: observation.series,
      d114SecurityIdentity: observation.securityIdentity ?? null,
      state: resolution.state,
      outcomeClass: classifyObservationOutcome(resolution.state, reason),
      issuerId: resolution.issuerId,
      securityId: resolution.securityId,
      listingId: resolution.listingId,
      resolutionBasis: resolution.resolutionBasis,
      reason,
      reasonText: reasonText(reason),
      // Assessable only when identity resolved AND the governed instrument is in scope. Never assumed.
      assessable: resolution.state === 'RESOLVED' && resolution.listingId !== null,
    };
  });
}

function sendJson(res: http.ServerResponse, status: number, body: unknown, head: boolean): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(head ? undefined : JSON.stringify(body));
}

export async function handleHoldingIdentityRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  providers: HoldingIdentityProviders,
): Promise<boolean> {
  if (!isHoldingIdentityPath(req.url)) return false;

  const method = (req.method ?? 'GET').toUpperCase();
  const head = method === 'HEAD';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, {
      Allow: 'GET, HEAD',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(method === 'OPTIONS' || head ? undefined : JSON.stringify(HOLDING_IDENTITY_ERRORS.methodNotAllowed));
    return true;
  }

  const portfolioId = parsePortfolioIdOf(req.url);
  if (portfolioId === null) {
    sendJson(res, 400, HOLDING_IDENTITY_ERRORS.invalidRequest, head);
    return true;
  }

  const loaded = (providers.loadSources ?? (() => loadRuntimeIdentitySources()))();
  if (!loaded.available) {
    sendJson(
      res,
      503,
      {
        ...HOLDING_IDENTITY_ERRORS.identitySourcesUnavailable,
        issues: loaded.issues.map((issue) => ({ file: issue.file, code: issue.code, subject: issue.subject })),
      },
      head,
    );
    return true;
  }

  let holdings: readonly G2HoldingView[];
  try {
    holdings = await providers.holdings(portfolioId);
  } catch {
    // Sanitized: no socket, no path, no upstream message.
    sendJson(res, 503, HOLDING_IDENTITY_ERRORS.holdingsUnavailable, head);
    return true;
  }

  const asOf = (providers.today ?? (() => new Date().toISOString().slice(0, 10)))();
  sendJson(
    res,
    200,
    {
      status: 'OK',
      portfolioId,
      count: holdings.length,
      identities: resolveHoldingIdentities(portfolioId, holdings, loaded.sources, asOf),
      directory: {
        rosterVersion: loaded.sources.versions.rosterVersion,
        rosterDigest: loaded.sources.versions.rosterDigest,
        rosterDataClass: loaded.sources.rosterDataClass,
        issuerCount: loaded.sources.roster.issuers.length,
        securityCount: loaded.sources.roster.securities.length,
        listingCount: loaded.sources.listingMap.entries.length,
        corporateActionCount: loaded.sources.corporateActionTable.actions.length,
        corporateActionsEmpty: loaded.sources.corporateActionTable.actions.length === 0,
      },
      disclosures: {
        decisionSupportOnly: true,
        nonProduction: true,
        independentOfDispositions: true,
      },
    },
    head,
  );
  return true;
}
