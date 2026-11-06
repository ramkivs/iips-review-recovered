/**
 * IID-5 — change-intelligence read transport (GET/HEAD only).
 *
 * Two documented routes, no others:
 *   GET|HEAD /api/investment/company/:issuerId/changes               adjacent version comparisons
 *   GET|HEAD /api/investment/company/:issuerId/changes/boundaries    stored boundary reports and coverage
 *
 * READ-ONLY, STRUCTURALLY. Comparing versions and explaining boundaries are READS; they compose nothing into
 * the store. Boundary reports are written by the operator CLI (the same rule as assessments and dispositions: a
 * browser may not mint a durable artifact), so this surface has no mutating route and answers 405 before it
 * resolves an owner or a store.
 *
 * WHAT THE RESPONSE MAY AND MAY NOT CLAIM. Every response carries the comparison's provenance — both versions'
 * digests, grammar, model/policy identity, dataset identity — plus an explicit `attribution.status`. An
 * `UNAVAILABLE` attribution is served as `UNAVAILABLE`; it is never softened into "no model effect". The
 * response never states an action, and the disclosure block says so in the same words the platform uses.
 *
 * FAIL-CLOSED SHAPE. Fixed, sanitized failure bodies. No scope token echo, no store path, no report id echo
 * beyond what the caller supplied, no stack trace, no partial history. A chain that fails validation is a 503.
 */
import type http from 'node:http';

import { companyScopeToken } from '../../../iips-platform/src/investment/artifacts/scopeToken.js';
import { parseIssuerId } from '../../../iips-platform/src/investment/contracts/ids.js';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable.js';
import { sendJson } from '../owner-scoped-http.js';
import { resolveReportsOwnerContext, type ReportsOwnerContext } from '../reports-owner-resolver.js';
import { loadAuthoritativeNp04Persistence } from '../reports/persistence-port.js';
import { ASSESSMENT_REPORT_TYPE, InvestmentArtifactError } from './investmentArtifacts.js';
import { CHANGE_REPORT_TYPE } from './changeComposition.js';
import { createChangeService, type ChangeService, type PairComparison } from './changeService.js';

export const CHANGE_ROUTES = Object.freeze([
  Object.freeze({
    id: 'company-changes',
    pattern: '/api/investment/company/:issuerId/changes',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description:
      'Adjacent-version comparisons for one issuer chain, with change dimensions, materiality, attribution and review focus. Optional ?from= and ?to= select one pair (artifactVersion or report id).',
  }),
  Object.freeze({
    id: 'company-change-boundaries',
    pattern: '/api/investment/company/:issuerId/changes/boundaries',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'Stored change reports for one issuer chain and which consecutive version pairs they explain.',
  }),
] as const);

export const CHANGE_TRANSPORT_SEMANTICS = Object.freeze({
  surface: 'IID-5',
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

export const CHANGE_TRANSPORT_ERRORS = Object.freeze({
  requestInvalid: Object.freeze({
    error: 'change-request-invalid',
    detail: Object.freeze({ reason: 'The issuer scope or the requested version selection is not admissible.' }),
  }),
  notFound: Object.freeze({
    error: 'change-not-found',
    detail: Object.freeze({ reason: 'No stored chain or version matches this request.' }),
  }),
  persistenceUnavailable: Object.freeze({
    error: 'investment-persistence-unavailable',
    detail: Object.freeze({ reason: 'No governed persistence boundary is available. No data was read or written.' }),
  }),
  integrityFailure: Object.freeze({
    error: 'change-integrity-failure',
    detail: Object.freeze({ reason: 'Stored investment artifacts failed validation and no comparison was served.' }),
  }),
  methodNotAllowed: Object.freeze({ error: 'method-not-allowed' }),
});

export const CHANGE_RESPONSE_DISCLOSURES = Object.freeze({
  decisionSupportOnly: true,
  noTradeExecution: true,
  nonProduction: true,
  notAnInstruction:
    'A change report explains what moved between two stored versions. It is not investment advice, a recommendation, or an order.',
  operationallyCaused: true,
  metadataNotice:
    'A GENERATION_METADATA_ONLY classification means nothing substantive changed; a FRESHNESS_TRANSITION means the only substantive movement was the statement-freshness verdict and the fields that depend on it.',
  note: 'Comparisons are computed on read from stored versions and are not themselves persisted by this route.',
});

/** Limitation identifiers carried on every response. Prose lives in the register. */
export const CHANGE_RESPONSE_LIMITATIONS = Object.freeze([
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
  'L-016',
]);

export interface ChangeTransportDependencies {
  readonly loadPort?: () => Promise<unknown>;
  readonly resolveOwner?: (env?: NodeJS.ProcessEnv) => ReportsOwnerContext | null;
  /** Injectable service for tests: no store, no port, no owner resolution. */
  readonly service?: ChangeService;
  readonly maxComparisons?: number;
}

type ParsedRoute =
  | { readonly kind: 'changes'; readonly issuerId: string; readonly from: string | null; readonly to: string | null }
  | { readonly kind: 'boundaries'; readonly issuerId: string }
  | { readonly kind: 'notMine' }
  | { readonly kind: 'invalid' };

const DEFAULT_MAX_COMPARISONS = 50;
const SELECTOR_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._-]{0,119}$/;

/** True when the URL belongs to this namespace (so the dispatcher can route it here before IID-3's mount). */
export function isChangePath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0] ?? '';
  const segments = path.split('/').filter((segment) => segment.length > 0);
  return (
    segments.length >= 5 &&
    segments[0] === 'api' &&
    segments[1] === 'investment' &&
    segments[2] === 'company' &&
    segments[4] === 'changes'
  );
}

export function parseChangeRoute(url: string | undefined): ParsedRoute {
  const raw = url ?? '';
  const path = raw.split('?')[0] ?? '';
  if (!isChangePath(path)) return { kind: 'notMine' };
  const query = new URLSearchParams(raw.includes('?') ? raw.slice(raw.indexOf('?') + 1) : '');
  const segments = path.split('/').filter((segment) => segment.length > 0);
  let issuerId: string;
  try {
    issuerId = decodeURIComponent(segments[3]!);
  } catch {
    return { kind: 'invalid' };
  }
  if (issuerId.length === 0) return { kind: 'invalid' };

  const from = query.get('from');
  const to = query.get('to');
  for (const selector of [from, to]) {
    if (selector !== null && !SELECTOR_PATTERN.test(selector)) return { kind: 'invalid' };
  }

  if (segments.length === 5) return { kind: 'changes', issuerId, from, to };
  if (segments.length === 6 && segments[5] === 'boundaries') {
    if (from !== null || to !== null) return { kind: 'invalid' };
    return { kind: 'boundaries', issuerId };
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
    return { status: 503, body: CHANGE_TRANSPORT_ERRORS.integrityFailure };
  }
  switch (error.code) {
    case 'SCOPE_TOKEN_INVALID':
    case 'REPORT_TYPE_SCOPE_MISMATCH':
      return { status: 400, body: CHANGE_TRANSPORT_ERRORS.requestInvalid };
    case 'CHAIN_NOT_FOUND':
    case 'VERSION_NOT_FOUND':
      return { status: 404, body: CHANGE_TRANSPORT_ERRORS.notFound };
    case 'PERSISTENCE_UNAVAILABLE':
      return { status: 503, body: CHANGE_TRANSPORT_ERRORS.persistenceUnavailable };
    default:
      return { status: 503, body: CHANGE_TRANSPORT_ERRORS.integrityFailure };
  }
}

/**
 * Resolve a `?from=`/`?to=` selector against a chain's versions.
 *
 * A selector is either an `artifactVersion` number or a `reportId`. Both resolve to a version INDEX, so an
 * ambiguous or unknown selector is refused rather than guessed — the whole point of the route is that the two
 * versions being compared are unambiguous.
 */
function resolveSelector(versions: readonly { reportId: string; artifactVersion: number }[], selector: string): number {
  const exact = versions.findIndex((version) => version.reportId === selector);
  if (exact >= 0) return exact;
  if (/^[0-9]{1,6}$/.test(selector)) {
    const wanted = Number(selector);
    const byVersion = versions.findIndex((version) => version.artifactVersion === wanted);
    if (byVersion >= 0) return byVersion;
  }
  throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'requested version selector is not a version of this chain', {
    selector,
  });
}

/** The transport projection of one comparison. Never contains a recommendation or an instruction. */
export function buildComparisonEntry(pair: PairComparison): Record<string, unknown> {
  return {
    from: pair.from,
    to: pair.to,
    classification: pair.comparison.classification,
    substantiveIdentityChanged: pair.comparison.substantiveIdentityChanged,
    payloadIdentityChanged: pair.comparison.payloadIdentityChanged,
    summary: pair.comparison.summary,
    changes: pair.comparison.items,
    metadata: pair.comparison.metadata,
    attribution: pair.attribution,
    review: pair.review,
    reproduction: pair.reproduction,
    persisted: pair.persisted,
  };
}

export async function handleChangeRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: ChangeTransportDependencies = {},
): Promise<boolean> {
  const route = parseChangeRoute(req.url);
  if (route.kind === 'notMine') return false;

  const method = (req.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, {
      Allow: CHANGE_TRANSPORT_SEMANTICS.methods.join(', '),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    if (method === 'OPTIONS') res.end();
    else res.end(JSON.stringify(CHANGE_TRANSPORT_ERRORS.methodNotAllowed));
    return true;
  }

  if (route.kind === 'invalid') {
    respondJsonOrHead(req, res, 400, CHANGE_TRANSPORT_ERRORS.requestInvalid);
    return true;
  }

  // Identity first: a malformed issuer is a 400 that never reaches an owner resolution or a store, and a
  // well-formed but unknown issuer is a 404 from the read path. Parsing before the store also keeps the two
  // failure kinds distinguishable, which is what makes 400 vs 404 informative rather than decorative.
  let issuerId: string;
  let subjectScope: string;
  try {
    issuerId = parseIssuerId(route.issuerId);
    subjectScope = companyScopeToken(issuerId);
  } catch {
    respondJsonOrHead(req, res, 400, CHANGE_TRANSPORT_ERRORS.requestInvalid);
    return true;
  }

  let service: ChangeService;
  if (deps.service !== undefined) {
    service = deps.service;
  } else {
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
      respondJsonOrHead(req, res, 503, CHANGE_TRANSPORT_ERRORS.persistenceUnavailable);
      return true;
    }
    service = createChangeService({ port, owner: { tenantId: owner.tenantId, userId: owner.ownerUserId } });
  }

  try {
    if (route.kind === 'boundaries') {
      const boundaries = service.boundaries({ subjectScope, reportType: ASSESSMENT_REPORT_TYPE });
      const coverage = service.coverage({ subjectScope, reportType: ASSESSMENT_REPORT_TYPE });
      const body = {
        status: 'OK',
        changeReportType: CHANGE_REPORT_TYPE,
        subjectScope,
        coverage,
        count: boundaries.length,
        boundaries,
        disclosures: CHANGE_RESPONSE_DISCLOSURES,
        limitations: CHANGE_RESPONSE_LIMITATIONS,
      };
      respondJsonOrHead(req, res, 200, body);
      return true;
    }

    const chain = await Promise.resolve(
      service.adjacentComparisons({ subjectScope, reportType: ASSESSMENT_REPORT_TYPE }),
    );

    let pairs: readonly PairComparison[];
    let truncated = false;
    if (route.from !== null || route.to !== null) {
      // A single explicit pair: both selectors are resolved against the chain's own versions.
      const versions = chain.length === 0 ? [] : [chain[0]!.from, ...chain.map((pair) => pair.to)];
      if (versions.length === 0) {
        throw new InvestmentArtifactError('CHAIN_NOT_FOUND', 'no versions exist to compare', { subjectScope });
      }
      const fromIndex = route.from === null ? versions.length - 2 : resolveSelector(versions, route.from);
      const toIndex = route.to === null ? versions.length - 1 : resolveSelector(versions, route.to);
      if (fromIndex < 0 || toIndex <= fromIndex) {
        throw new InvestmentArtifactError('VERSION_NOT_FOUND', 'the requested pair does not move forward', {
          fromIndex,
          toIndex,
        });
      }
      const selected = service.compareVersions({
        subjectScope,
        reportType: ASSESSMENT_REPORT_TYPE,
        fromReportId: versions[fromIndex]!.reportId,
        toReportId: versions[toIndex]!.reportId,
      });
      pairs = [selected];
    } else {
      const limit = deps.maxComparisons ?? DEFAULT_MAX_COMPARISONS;
      truncated = chain.length > limit;
      pairs = truncated ? chain.slice(chain.length - limit) : chain;
    }

    const body = {
      status: 'OK',
      reportType: ASSESSMENT_REPORT_TYPE,
      subjectScope,
      pairCount: chain.length,
      returned: pairs.length,
      truncated,
      comparisons: pairs.map(buildComparisonEntry),
      disclosures: CHANGE_RESPONSE_DISCLOSURES,
      limitations: CHANGE_RESPONSE_LIMITATIONS,
    };
    respondJsonOrHead(req, res, 200, body);
    return true;
  } catch (error) {
    const { status, body } = mapError(error);
    respondJsonOrHead(req, res, status, body);
    return true;
  }
}
