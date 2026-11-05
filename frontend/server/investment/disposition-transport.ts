/**
 * IID-4 — disposition read transport (GET/HEAD only).
 *
 * Three documented routes, no others:
 *   GET|HEAD /api/investment/portfolio/:portfolioId/dispositions          every holding disposition in a portfolio
 *   GET|HEAD /api/investment/portfolio/:portfolioId/holding/:securityId   one held position's disposition chain
 *   GET|HEAD /api/investment/candidate/:securityId                        one candidate's disposition chain
 *
 * WHY READ-ONLY IS STRUCTURAL, AGAIN. Dispositions are created by the operator CLI, exactly like assessments:
 * a verb that a browser could produce is a verb nobody reviewed. There is no route table entry for a mutating
 * method, and the dispatcher answers 405 before it resolves an owner or a store.
 *
 * The candidate route exists because a candidate has no position: `/portfolio/.../holding/...` cannot address
 * it without inventing a holding, so it gets its own path over its own `hc:` chain (R-8).
 *
 * FAIL-CLOSED SHAPE. Fixed, sanitized failure bodies. No scope token echo, no store path, no SQL, no stack
 * trace, no partial chain. An integrity failure is a 503, never a 200 with a shortened history.
 */
import type http from 'node:http';

import { parseSecurityId } from '../../../iips-platform/src/investment/contracts/ids.js';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable.js';
import { sendJson } from '../owner-scoped-http.js';
import { resolveReportsOwnerContext, type ReportsOwnerContext } from '../reports-owner-resolver.js';
import { loadAuthoritativeNp04Persistence } from '../reports/persistence-port.js';
import {
  DISPOSITION_REPORT_TYPE,
} from './dispositionComposition.js';
import { createDispositionRecordsService } from './dispositionService.js';
import { InvestmentArtifactError, type InvestmentChainView, type InvestmentVersionView } from './investmentArtifacts.js';

export const DISPOSITION_ROUTES = Object.freeze([
  Object.freeze({
    id: 'portfolio-dispositions',
    pattern: '/api/investment/portfolio/:portfolioId/dispositions',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'Chain heads and verbs for every holding disposition in one portfolio.',
  }),
  Object.freeze({
    id: 'holding-disposition',
    pattern: '/api/investment/portfolio/:portfolioId/holding/:securityId',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: "One held position's disposition: chain head, version history and the disposition payload.",
  }),
  Object.freeze({
    id: 'candidate-disposition',
    pattern: '/api/investment/candidate/:securityId',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: "One candidate's disposition (no position, `hc:` chain). Optional ?portfolio= names its context.",
  }),
] as const);

export const DISPOSITION_TRANSPORT_SEMANTICS = Object.freeze({
  surface: 'IID-4',
  methods: Object.freeze(['GET', 'HEAD']),
  mutatingOperations: Object.freeze([]),
  createsArtifacts: false,
  appendsVersions: false,
  exposesStore: false,
  acceptsOrders: false,
  acceptsQuantities: false,
  substitutesStore: false,
  failureStatuses: Object.freeze([400, 404, 405, 503]),
});

export const DISPOSITION_TRANSPORT_ERRORS = Object.freeze({
  requestInvalid: Object.freeze({
    error: 'disposition-request-invalid',
    detail: Object.freeze({ reason: 'The portfolio or security identity in the request is not admissible.' }),
  }),
  notFound: Object.freeze({
    error: 'disposition-not-found',
    detail: Object.freeze({ reason: 'No stored disposition exists for this request.' }),
  }),
  persistenceUnavailable: Object.freeze({
    error: 'investment-persistence-unavailable',
    detail: Object.freeze({
      reason: 'No governed persistence boundary is available. No data was read or written.',
    }),
  }),
  integrityFailure: Object.freeze({
    error: 'disposition-integrity-failure',
    detail: Object.freeze({ reason: 'Stored disposition artifacts failed validation and were not served.' }),
  }),
  methodNotAllowed: Object.freeze({ error: 'method-not-allowed' }),
});

export const DISPOSITION_RESPONSE_DISCLOSURES = Object.freeze({
  decisionSupportOnly: true,
  noTradeExecution: true,
  nonProduction: true,
  notAnInstruction: 'This is a decision-support implication, not an order or a trade instruction.',
  datasetNotice: 'Disposition inputs are the stored company assessment plus the portfolio read model; see datasetClass.',
});

/** The limitation identifiers carried on every response. Prose lives in the register. */
export const DISPOSITION_RESPONSE_LIMITATIONS = Object.freeze([
  'L-001',
  'L-002',
  'L-003',
  'L-004',
  'L-005',
  'L-006',
  'L-007',
  'L-008',
  'L-009',
  'L-010',
  'L-011',
  'L-012',
  'L-013',
  'L-014',
  'L-015',
]);

export interface DispositionTransportDependencies {
  readonly loadPort?: () => Promise<unknown>;
  readonly resolveOwner?: (env?: NodeJS.ProcessEnv) => ReportsOwnerContext | null;
}

type ParsedRoute =
  | { readonly kind: 'list'; readonly portfolioId: string }
  | { readonly kind: 'holding'; readonly portfolioId: string; readonly securityId: string }
  | { readonly kind: 'candidate'; readonly securityId: string; readonly contextPortfolioId: string | null }
  | { readonly kind: 'invalid' };

const PORTFOLIO_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;

function decodeSegment(segment: string | undefined): string | null {
  if (segment === undefined || segment.length === 0) return null;
  try {
    const decoded = decodeURIComponent(segment);
    return decoded.length === 0 ? null : decoded;
  } catch {
    return null;
  }
}

export function isDispositionPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path.startsWith('/api/investment/portfolio/') || path.startsWith('/api/investment/candidate/');
}

/** Parse the route. Segments are split before decoding, so an encoded `/` inside an id stays one segment. */
export function parseDispositionRoute(url: string | undefined): ParsedRoute | null {
  const raw = url ?? '';
  const path = raw.split('?')[0];
  if (!isDispositionPath(path)) return null;
  const query = new URLSearchParams(raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '');
  const segments = path.split('/').filter((segment) => segment.length > 0);
  // api / investment / <portfolio|candidate> / ...
  if (segments.length < 4) return { kind: 'invalid' };

  if (segments[2] === 'candidate') {
    if (segments.length !== 4) return { kind: 'invalid' };
    const securityId = decodeSegment(segments[3]);
    if (securityId === null) return { kind: 'invalid' };
    const context = query.get('portfolio');
    if (context !== null && !PORTFOLIO_ID_PATTERN.test(context)) return { kind: 'invalid' };
    return { kind: 'candidate', securityId, contextPortfolioId: context };
  }

  if (segments[2] !== 'portfolio') return { kind: 'invalid' };
  const portfolioId = decodeSegment(segments[3]);
  if (portfolioId === null || !PORTFOLIO_ID_PATTERN.test(portfolioId)) return { kind: 'invalid' };

  if (segments.length === 5 && segments[4] === 'dispositions') {
    return { kind: 'list', portfolioId };
  }
  if (segments.length === 7 && segments[4] === 'holding' && segments[6] === 'disposition') {
    const securityId = decodeSegment(segments[5]);
    return securityId === null ? { kind: 'invalid' } : { kind: 'holding', portfolioId, securityId };
  }
  // The documented short form: /portfolio/:portfolioId/holding/:securityId
  if (segments.length === 6 && segments[4] === 'holding') {
    const securityId = decodeSegment(segments[5]);
    return securityId === null ? { kind: 'invalid' } : { kind: 'holding', portfolioId, securityId };
  }
  return { kind: 'invalid' };
}

function endHead(res: http.ServerResponse, status: number, headers: http.OutgoingHttpHeaders): void {
  res.writeHead(status, headers);
  res.end();
}

function respondJsonOrHead(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders: http.OutgoingHttpHeaders = {},
): void {
  if ((req.method ?? 'GET').toUpperCase() === 'HEAD') {
    endHead(res, status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  for (const [key, value] of Object.entries(extraHeaders)) res.setHeader(key, value as never);
  sendJson(res, status, payload);
}

function mapError(error: unknown): { status: number; body: unknown } {
  if (!(error instanceof InvestmentArtifactError)) {
    return { status: 503, body: DISPOSITION_TRANSPORT_ERRORS.integrityFailure };
  }
  switch (error.code) {
    case 'SCOPE_TOKEN_INVALID':
    case 'REPORT_TYPE_SCOPE_MISMATCH':
      return { status: 400, body: DISPOSITION_TRANSPORT_ERRORS.requestInvalid };
    case 'CHAIN_NOT_FOUND':
    case 'VERSION_NOT_FOUND':
      return { status: 404, body: DISPOSITION_TRANSPORT_ERRORS.notFound };
    case 'PERSISTENCE_UNAVAILABLE':
      return { status: 503, body: DISPOSITION_TRANSPORT_ERRORS.persistenceUnavailable };
    default:
      return { status: 503, body: DISPOSITION_TRANSPORT_ERRORS.integrityFailure };
  }
}

export function buildDispositionResponse(
  chain: InvestmentChainView,
  version: InvestmentVersionView,
  disposition: unknown,
): Record<string, unknown> {
  return {
    status: 'OK',
    reportType: chain.reportType,
    scope: {
      scopeToken: chain.scopeToken,
      reportKey: chain.reportKey,
      chainRootReportId: chain.chainRootReportId,
      versionCount: chain.versionCount,
    },
    version,
    versions: chain.versions,
    // The canonical payload, verbatim: the transport is a projection, not an editor.
    disposition,
    disclosures: DISPOSITION_RESPONSE_DISCLOSURES,
    limitations: DISPOSITION_RESPONSE_LIMITATIONS,
  };
}

/**
 * Handle the disposition namespace. Returns `true` when the request was handled here.
 *
 * Order: method, then identities, then owner, then store — so a malformed request never reaches a store or
 * resolves an owner.
 */
export async function handleDispositionRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: DispositionTransportDependencies = {},
): Promise<boolean> {
  const route = parseDispositionRoute(req.url);
  if (route === null) return false;

  const method = (req.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, {
      Allow: DISPOSITION_TRANSPORT_SEMANTICS.methods.join(', '),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    if (method === 'OPTIONS') res.end();
    else res.end(JSON.stringify(DISPOSITION_TRANSPORT_ERRORS.methodNotAllowed));
    return true;
  }

  if (route.kind === 'invalid') {
    respondJsonOrHead(req, res, 400, DISPOSITION_TRANSPORT_ERRORS.requestInvalid);
    return true;
  }

  // Identities before anything else: a security id must be a real ISIN-bearing security identity, so a symbol
  // or a sector label in the path is refused here rather than being looked up as if it were one.
  if (route.kind === 'holding' || route.kind === 'candidate') {
    try {
      parseSecurityId(route.securityId);
    } catch {
      respondJsonOrHead(req, res, 400, DISPOSITION_TRANSPORT_ERRORS.requestInvalid);
      return true;
    }
  }

  const owner = (deps.resolveOwner ?? resolveReportsOwnerContext)();
  if (owner === null) {
    if (method === 'HEAD') {
      endHead(res, 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return true;
    }
    respondOwnerContextUnavailable(res);
    return true;
  }

  let port: unknown;
  try {
    port = await (deps.loadPort ?? loadAuthoritativeNp04Persistence)();
  } catch {
    port = null;
  }
  if (port === null || port === undefined) {
    respondJsonOrHead(req, res, 503, DISPOSITION_TRANSPORT_ERRORS.persistenceUnavailable);
    return true;
  }

  try {
    const service = createDispositionRecordsService({
      port,
      owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
    });

    if (route.kind === 'list') {
      const entries = service.listPortfolio(route.portfolioId);
      const body = {
        status: 'OK',
        reportType: DISPOSITION_REPORT_TYPE,
        portfolioId: route.portfolioId,
        count: entries.length,
        dispositions: entries,
        disclosures: DISPOSITION_RESPONSE_DISCLOSURES,
        limitations: DISPOSITION_RESPONSE_LIMITATIONS,
      };
      if (method === 'HEAD') {
        endHead(res, 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return true;
      }
      res.setHeader('Cache-Control', 'no-store');
      sendJson(res, 200, body);
      return true;
    }

    const result =
      route.kind === 'holding'
        ? service.readHolding(route.portfolioId, route.securityId)
        : service.readCandidate(route.contextPortfolioId, route.securityId);

    const extraHeaders = { 'X-Investment-Artifact-Version': String(result.version.artifactVersion) };
    respondJsonOrHead(req, res, 200, buildDispositionResponse(result.chain, result.version, result.payload), extraHeaders);
    return true;
  } catch (error) {
    const { status, body } = mapError(error);
    respondJsonOrHead(req, res, status, body);
    return true;
  }
}
