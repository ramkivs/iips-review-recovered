/**
 * IID-3 — investment read transport (GET/HEAD only).
 *
 * Three documented routes, no others:
 *   GET|HEAD /api/investment/company/:issuerId                      assessment chain head + version history
 *   GET|HEAD /api/investment/company/:issuerId/versions/:reportId    one version, inside a validated chain
 *   GET|HEAD /api/investment/coverage                                IID-1 coverage disclosure (separate module)
 *
 * WHY READ-ONLY IS STRUCTURAL. There is no route table entry for a mutating method, and the dispatcher
 * answers 405 for anything that is not GET/HEAD before it resolves an owner or a store. Creation and
 * versioning happen only through the operator CLI, deliberately: a durable artifact that a browser could
 * create is an artifact whose inputs nobody reviewed.
 *
 * FAIL-CLOSED SHAPE. Every failure is a fixed, sanitized body. No store path, no SQL, no owner pair, no
 * report id echo, no stack trace, and no partial data are ever returned. An integrity failure (corrupted
 * or scope-drifted chain) is a 503, not a 200 with an empty list: serving a truncated chain would be worse
 * than serving nothing, because version history is the thing being trusted.
 *
 * The owner context comes from the same server-owned carrier seam as the Reports surface. When it is not
 * established, this surface answers exactly the same 503 as Reports does — it does not invent an owner.
 */
import type http from 'node:http';

import { companyScopeToken } from '../../../iips-platform/src/investment/artifacts/scopeToken';
import { parseIssuerId } from '../../../iips-platform/src/investment/contracts/ids';
import { respondOwnerContextUnavailable } from '../owner-context-unavailable.js';
import { sendJson } from '../owner-scoped-http.js';
import { resolveReportsOwnerContext, type ReportsOwnerContext } from '../reports-owner-resolver.js';
import { loadAuthoritativeNp04Persistence } from '../reports/persistence-port.js';
import {
  ASSESSMENT_REPORT_TYPE,
  InvestmentArtifactError,
  createInvestmentArtifactService,
  type InvestmentChainView,
  type InvestmentVersionView,
} from './investmentArtifacts.js';

/** The complete investment route table. Every entry is read-only by construction. */
export const INVESTMENT_ROUTES = Object.freeze([
  Object.freeze({
    id: 'company-assessment',
    pattern: '/api/investment/company/:issuerId',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'Assessment chain head, version history and disclosures for one issuer scope.',
  }),
  Object.freeze({
    id: 'company-assessment-version',
    pattern: '/api/investment/company/:issuerId/versions/:reportId',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'One assessment version, served only after its whole chain validates.',
  }),
  Object.freeze({
    id: 'investment-coverage',
    pattern: '/api/investment/coverage',
    methods: Object.freeze(['GET', 'HEAD'] as const),
    mutating: false as const,
    description: 'IID-1 measured-coverage and identity-source disclosure (served by the coverage transport).',
  }),
] as const);

/** Machine-readable semantics of this surface, asserted by the route-table test. */
export const INVESTMENT_TRANSPORT_SEMANTICS = Object.freeze({
  surface: 'IID-3',
  methods: Object.freeze(['GET', 'HEAD']),
  mutatingOperations: Object.freeze([]),
  createsArtifacts: false,
  appendsVersions: false,
  exposesStore: false,
  substitutesStore: false,
  failureStatuses: Object.freeze([400, 404, 405, 503]),
});

/** Static, sanitized failure bodies. Nothing dynamic, by design. */
export const INVESTMENT_TRANSPORT_ERRORS = Object.freeze({
  scopeInvalid: Object.freeze({
    error: 'investment-scope-invalid',
    detail: Object.freeze({ reason: 'The issuer scope token in the request is not admissible.' }),
  }),
  notFound: Object.freeze({
    error: 'investment-artifact-not-found',
    detail: Object.freeze({ reason: 'No stored assessment exists for this request.' }),
  }),
  persistenceUnavailable: Object.freeze({
    error: 'investment-persistence-unavailable',
    detail: Object.freeze({
      reason: 'No governed persistence boundary is available. No data was read or written.',
    }),
  }),
  integrityFailure: Object.freeze({
    error: 'investment-artifact-integrity-failure',
    detail: Object.freeze({
      reason: 'Stored investment artifacts failed validation and were not served.',
    }),
  }),
  methodNotAllowed: Object.freeze({ error: 'method-not-allowed' }),
});

/** Disclosures carried on every successful response, so a client cannot render an assessment without them. */
export const INVESTMENT_RESPONSE_DISCLOSURES = Object.freeze({
  decisionSupportOnly: true,
  noTradeExecution: true,
  nonProduction: true,
  datasetNotice: 'Assessment inputs are operator-supplied; see datasetClass and the limitation register.',
});

/** Limitation identifiers carried on every response. Prose lives in the register, not in this module. */
export const INVESTMENT_RESPONSE_LIMITATIONS = Object.freeze([
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
]);

export interface InvestmentTransportDependencies {
  /** Resolve the governed persistence boundary. Injected so the fail-closed path can be proven. */
  readonly loadPort?: () => Promise<unknown>;
  /** Resolve the owner context. Injected so the owner-unavailable path can be proven. */
  readonly resolveOwner?: (env?: NodeJS.ProcessEnv) => ReportsOwnerContext | null;
}

interface ParsedRoute {
  readonly kind: 'company' | 'version';
  readonly issuerId: string;
  readonly reportId: string | null;
}

export function isInvestmentPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/investment/company' || path.startsWith('/api/investment/company/');
}

/**
 * Parse the route.
 *
 * Segments are split BEFORE decoding, so an issuer id containing a literal `/` (encoded as `%2F`) stays one
 * segment. Anything that decodes to an empty value, or that carries a second `/versions/` marker, is
 * rejected rather than guessed at.
 */
export function parseInvestmentRoute(url: string | undefined): ParsedRoute | { readonly kind: 'invalid' } | null {
  const path = (url ?? '').split('?')[0];
  if (!isInvestmentPath(path)) return null;
  const segments = path.split('/').filter((segment) => segment.length > 0);
  // ['api','investment','company', ...]
  if (segments.length < 4) return { kind: 'invalid' };
  let issuerId: string;
  try {
    issuerId = decodeURIComponent(segments[3]!);
  } catch {
    return { kind: 'invalid' };
  }
  if (segments.length === 4) {
    return issuerId.length === 0 ? { kind: 'invalid' } : { kind: 'company', issuerId, reportId: null };
  }
  if (segments.length === 6 && segments[4] === 'versions') {
    let reportId: string;
    try {
      reportId = decodeURIComponent(segments[5]!);
    } catch {
      return { kind: 'invalid' };
    }
    if (issuerId.length === 0 || reportId.length === 0) return { kind: 'invalid' };
    return { kind: 'version', issuerId, reportId };
  }
  return { kind: 'invalid' };
}

/** The response envelope for one version, built from a validated chain. */
export function buildAssessmentResponse(
  chain: InvestmentChainView,
  version: InvestmentVersionView,
  payload: string,
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
    // The canonical payload of the requested version, verbatim: the transport is a projection, not an editor.
    assessment: JSON.parse(payload) as unknown,
    disclosures: INVESTMENT_RESPONSE_DISCLOSURES,
    limitations: INVESTMENT_RESPONSE_LIMITATIONS,
  };
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
): void {
  if ((req.method ?? 'GET').toUpperCase() === 'HEAD') {
    endHead(res, status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return;
  }
  res.setHeader('Cache-Control', 'no-store');
  sendJson(res, status, payload);
}

function mapError(error: unknown): { status: number; body: unknown } {
  if (!(error instanceof InvestmentArtifactError)) {
    return { status: 503, body: INVESTMENT_TRANSPORT_ERRORS.integrityFailure };
  }
  switch (error.code) {
    case 'SCOPE_TOKEN_INVALID':
    case 'REPORT_TYPE_SCOPE_MISMATCH':
      return { status: 400, body: INVESTMENT_TRANSPORT_ERRORS.scopeInvalid };
    case 'CHAIN_NOT_FOUND':
    case 'VERSION_NOT_FOUND':
      return { status: 404, body: INVESTMENT_TRANSPORT_ERRORS.notFound };
    case 'PERSISTENCE_UNAVAILABLE':
      return { status: 503, body: INVESTMENT_TRANSPORT_ERRORS.persistenceUnavailable };
    default:
      // CHAIN_INVALID, CHAIN_SCOPE_DRIFT, CONTENT_DIGEST_MISMATCH, CONTENT_INVALID, WRITE_VERIFICATION_FAILED:
      // all integrity failures. Served as 503 with no data, never as a partial success.
      return { status: 503, body: INVESTMENT_TRANSPORT_ERRORS.integrityFailure };
  }
}

/**
 * Handle the investment namespace. Returns `true` when the request was handled here.
 *
 * Order matters: method, then scope token, then owner, then store. A malformed scope token is rejected
 * before the owner is resolved and before any store object exists, which is what makes AC-3.1 a property of
 * the request path rather than a property of the service alone.
 */
export async function handleInvestmentRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: InvestmentTransportDependencies = {},
): Promise<boolean> {
  const route = parseInvestmentRoute(req.url);
  if (route === null) return false;

  const method = (req.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, {
      Allow: INVESTMENT_TRANSPORT_SEMANTICS.methods.join(', '),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    if (method === 'OPTIONS') {
      res.end();
    } else {
      res.end(JSON.stringify(INVESTMENT_TRANSPORT_ERRORS.methodNotAllowed));
    }
    return true;
  }

  if (route.kind === 'invalid') {
    respondJsonOrHead(req, res, 400, INVESTMENT_TRANSPORT_ERRORS.scopeInvalid);
    return true;
  }

  // 1. Validate before anything else can happen: the path must carry an ISSUER identity (`IN:CIN:` or
  // `IN:EQISIN:`), and the scope token derived from it must be admissible. A symbol, a sector reference, a
  // portfolio id or anything else is refused HERE — before an owner is resolved, before a store is loaded and
  // before the port could be called (AC-3.1).
  let scopeToken: string;
  try {
    const issuerId = parseIssuerId(route.issuerId);
    scopeToken = companyScopeToken(issuerId);
  } catch {
    respondJsonOrHead(req, res, 400, INVESTMENT_TRANSPORT_ERRORS.scopeInvalid);
    return true;
  }

  // 2. Owner context (same server-owned seam as the Reports surface).
  const owner = (deps.resolveOwner ?? resolveReportsOwnerContext)();
  if (owner === null) {
    if (method === 'HEAD') {
      endHead(res, 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return true;
    }
    respondOwnerContextUnavailable(res);
    return true;
  }

  // 3. Governed persistence boundary. Absent ⇒ 503. No substitute store is constructed.
  let port: unknown;
  try {
    port = await (deps.loadPort ?? loadAuthoritativeNp04Persistence)();
  } catch {
    port = null;
  }
  if (port === null || port === undefined) {
    respondJsonOrHead(req, res, 503, INVESTMENT_TRANSPORT_ERRORS.persistenceUnavailable);
    return true;
  }

  try {
    const service = createInvestmentArtifactService({
      port,
      owner: { tenantId: owner.tenantId, userId: owner.ownerUserId },
    });
    const targetReportId = route.kind === 'version' ? route.reportId! : null;
    const read =
      targetReportId === null
        ? ((): { version: InvestmentVersionView; chain: InvestmentChainView; payload: string } => {
            const chain = service.readChain(scopeToken, ASSESSMENT_REPORT_TYPE);
            const { version, payload } = service.readVersionWithPayload(scopeToken, chain.head.reportId);
            return { version, chain, payload };
          })()
        : service.readVersionWithPayload(scopeToken, targetReportId, ASSESSMENT_REPORT_TYPE);

    if (method === 'HEAD') {
      endHead(res, 200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Investment-Artifact-Version': String(read.version.artifactVersion),
      });
      return true;
    }
    res.setHeader('Cache-Control', 'no-store');
    sendJson(res, 200, buildAssessmentResponse(read.chain, read.version, read.payload));
    return true;
  } catch (error) {
    const { status, body } = mapError(error);
    respondJsonOrHead(req, res, status, body);
    return true;
  }
}
