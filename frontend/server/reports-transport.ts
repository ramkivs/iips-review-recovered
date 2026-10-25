/**
 * NP-06 Reports HTTP boundary.
 *
 * Implements the authorized non-authentication Reports transport under Program Authority
 * decisions `IIPS-V3-REPORTS-NP06-R1-OWNERSHIP-DECLARATION-PA-DECISION-ACT-2026-10-25-01` and
 * `IIPS-V3-REPORTS-NP06-R2-CONTRACT-SHAPE-PA-DECISION-ACT-2026-10-25-01`.
 *
 * OWNER & SECURITY BOUNDARY (R1 / R2)
 *   - The server-owned Reports owner declaration is resolved per request from `IIPS_REPORTS_OWNER_PATH`.
 *   - If the carrier is absent, unreadable, invalid, or digest-mismatched, the transport fails closed
 *     with HTTP `503 owner-context-unavailable`.
 *   - All client-supplied tenant or identity claims are rejected with `400 Bad Request` (`C-4`).
 *   - All client-supplied durable identity fields (`reportId`, `artifactVersion`, `supersedesReportId`,
 *     `reportKey`, `schemaVersion`) are rejected with `400 Bad Request` (`C-5`).
 *   - All five operations execute under the single declared owner partition (`C-3` / `P-1`).
 *   - Cross-owner retrieval and unknown reports return `404 Not Found` without disclosure (`E-5`).
 *   - Supersession conflicts return `409 Conflict` (`E-3`).
 *   - Missing or unconfigured persistence foundation returns `503 persistence-unavailable` (`C-8`).
 */
import type http from 'node:http';
import { URLSearchParams } from 'node:url';
import { respondOwnerContextUnavailable } from './owner-context-unavailable';
import { resolveReportsOwnerContext, type ReportsOwnerContext } from './reports-owner-resolver';
import { readJsonBody, sendJson } from './owner-scoped-http';
import { ReportValidationError } from './reports/artifact';
import {
  ReportPersistenceError,
  ReportsPersistence,
} from './reports/persistence';
import {
  NP04_BOUNDARY,
  PersistenceBoundaryError,
  resolveAuthoritativeNp04Port,
} from './reports/np04-adapter';
import type { ComposeReportContentInput } from './reports/composition';

interface ReportsRoute {
  readonly methods: readonly string[];
}

const REPORTS_ROUTES: ReadonlyMap<string, ReportsRoute> = new Map([
  ['/api/reports/context', { methods: ['GET', 'HEAD'] }],
  ['/api/reports/artifacts', { methods: ['GET', 'HEAD', 'POST'] }],
  ['/api/reports/artifacts/:reportId', { methods: ['GET', 'HEAD'] }],
  ['/api/reports/artifacts/:reportId/versions', { methods: ['POST'] }],
  ['/api/reports/artifacts/:reportId/supersession', { methods: ['GET', 'HEAD'] }],
]);

/** Forbidden client-supplied identity/tenant claim keys (C-4). */
const FORBIDDEN_IDENTITY_KEYS = Object.freeze([
  'tenantId',
  'userId',
  'owner',
  'ownerUserId',
  'authenticatedUser',
  'principal',
  'companyId',
  'runtimeCompanyId',
]);

/** Forbidden client-supplied durable identity fields in creation/append bodies (C-5). */
const FORBIDDEN_DURABLE_KEYS = Object.freeze([
  'reportId',
  'artifactVersion',
  'supersedesReportId',
  'reportKey',
  'schemaVersion',
]);

function matchRoute(path: string): { route: ReportsRoute; reportId: string | null; isVersions: boolean; isSupersession: boolean } | null {
  const direct = REPORTS_ROUTES.get(path);
  if (direct) {
    return { route: direct, reportId: null, isVersions: false, isSupersession: false };
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length < 4 || segments[0] !== 'api' || segments[1] !== 'reports' || segments[2] !== 'artifacts') {
    return null;
  }

  let reportId: string;
  try {
    reportId = decodeURIComponent(segments[3]);
  } catch {
    return null;
  }
  if (!reportId || reportId.length === 0) return null;

  if (segments.length === 4) {
    const route = REPORTS_ROUTES.get('/api/reports/artifacts/:reportId');
    return route ? { route, reportId, isVersions: false, isSupersession: false } : null;
  }

  if (segments.length === 5 && segments[4] === 'versions') {
    const route = REPORTS_ROUTES.get('/api/reports/artifacts/:reportId/versions');
    return route ? { route, reportId, isVersions: true, isSupersession: false } : null;
  }

  if (segments.length === 5 && segments[4] === 'supersession') {
    const route = REPORTS_ROUTES.get('/api/reports/artifacts/:reportId/supersession');
    return route ? { route, reportId, isVersions: false, isSupersession: true } : null;
  }

  return null;
}

/** Identify the Reports namespace without matching neighbouring paths by prefix accident. */
export function isReportsPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/reports' || path.startsWith('/api/reports/');
}

function checkClientIdentityClaims(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') return false;
  const record = obj as Record<string, unknown>;
  return FORBIDDEN_IDENTITY_KEYS.some((key) => Object.prototype.hasOwnProperty.call(record, key));
}

function checkClientDurableKeys(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') return false;
  const record = obj as Record<string, unknown>;
  return FORBIDDEN_DURABLE_KEYS.some((key) => Object.prototype.hasOwnProperty.call(record, key));
}

function mapPersistenceErrorStatus(error: unknown): number {
  if (error instanceof ReportValidationError) return 400;
  if (error instanceof ReportPersistenceError) {
    const msg = error.message.toLowerCase();
    const cause = error.cause as { code?: string; message?: string } | undefined;
    const causeCode = cause?.code ?? '';
    const causeMsg = (cause?.message ?? '').toLowerCase();

    if (
      causeCode === 'NOT_FOUND' ||
      causeCode === 'CROSS_OWNER' ||
      causeCode === 'OWNER_MISMATCH' ||
      msg.includes('not found') ||
      causeMsg.includes('not found')
    ) {
      return 404;
    }
    if (
      causeCode === 'ALREADY_SUPERSEDED' ||
      causeCode === 'SUPERSEDED' ||
      causeCode === 'IMMUTABLE' ||
      msg.includes('superseded') ||
      causeMsg.includes('superseded') ||
      msg.includes('already superseded')
    ) {
      return 409;
    }
    if (causeCode === 'VALIDATION_FAILED' || causeMsg.includes('validation')) {
      return 400;
    }
  }
  if (error instanceof PersistenceBoundaryError) {
    return 503;
  }
  return 500;
}

/**
 * Handle the Reports namespace.
 *
 * Implements full R1 owner scoping and R2 non-authentication transport contracts.
 */
export async function handleReportsRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const rawUrl = req.url ?? '';
  const [path, queryString] = rawUrl.split('?');
  const method = req.method ?? 'GET';
  res.setHeader('Content-Type', 'application/json');

  const match = matchRoute(path);
  if (!match) {
    sendJson(res, 404, { error: 'not found' });
    return;
  }
  if (!match.route.methods.includes(method)) {
    res.writeHead(405, { Allow: match.route.methods.join(', '), 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'method-not-allowed' }));
    return;
  }

  // 1. Resolve owner context from server-owned carrier seam (R1).
  const owner = resolveReportsOwnerContext();
  if (owner === null) {
    respondOwnerContextUnavailable(res);
    return;
  }

  // 2. Reject client-supplied tenant / identity claims in query parameters (C-4).
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    for (const forbidden of FORBIDDEN_IDENTITY_KEYS) {
      if (searchParams.has(forbidden)) {
        sendJson(res, 400, { error: 'client-supplied tenant or identity claims are prohibited' });
        return;
      }
    }
  }

  // 3. GET /api/reports/context (does not require persistence foundation)
  if (path === '/api/reports/context') {
    sendJson(res, 200, {
      data: {
        surfaceName: 'NP-06',
        disposition: 'ESTABLISHED',
        tenantId: owner.tenantId,
        ownerUserId: owner.ownerUserId,
      },
    });
    return;
  }

  // 4. Resolve persistence foundation (C-8).
  const resolution = await resolveAuthoritativeNp04Port();
  if (!resolution.available) {
    sendJson(res, 503, { error: 'persistence-unavailable', reason: resolution.reason });
    return;
  }

  const persistence = new ReportsPersistence(resolution.port);
  const ownerPair = { tenantId: owner.tenantId, userId: owner.ownerUserId };

  try {
    // 5. GET /api/reports/artifacts
    if (path === '/api/reports/artifacts' && (method === 'GET' || method === 'HEAD')) {
      const searchParams = new URLSearchParams(queryString ?? '');
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;
      const cursor = searchParams.get('cursor') ?? undefined;

      const page = persistence.queryByOwner(ownerPair, { limit, cursor });
      sendJson(res, 200, { data: page.items, nextCursor: page.nextCursor });
      return;
    }

    // 6. POST /api/reports/artifacts (createInstance)
    if (path === '/api/reports/artifacts' && method === 'POST') {
      const bodyResult = await readJsonBody(req);
      if (!bodyResult.ok) {
        sendJson(res, bodyResult.status, { error: bodyResult.error });
        return;
      }
      const rawBody = bodyResult.value;
      if (checkClientIdentityClaims(rawBody)) {
        sendJson(res, 400, { error: 'client-supplied tenant or identity claims are prohibited' });
        return;
      }
      if (checkClientDurableKeys(rawBody)) {
        sendJson(res, 400, { error: 'client-supplied durable identity fields are prohibited' });
        return;
      }

      const created = persistence.persistNew(ownerPair, rawBody as ComposeReportContentInput);
      sendJson(res, 201, { data: created });
      return;
    }

    // 7. GET /api/reports/artifacts/:reportId
    if (match.reportId && !match.isVersions && !match.isSupersession && (method === 'GET' || method === 'HEAD')) {
      const artifact = persistence.resolve(ownerPair, match.reportId);
      sendJson(res, 200, { data: artifact });
      return;
    }

    // 8. POST /api/reports/artifacts/:reportId/versions (appendVersion)
    if (match.reportId && match.isVersions && method === 'POST') {
      const bodyResult = await readJsonBody(req);
      if (!bodyResult.ok) {
        sendJson(res, bodyResult.status, { error: bodyResult.error });
        return;
      }
      const rawBody = bodyResult.value;
      if (checkClientIdentityClaims(rawBody)) {
        sendJson(res, 400, { error: 'client-supplied tenant or identity claims are prohibited' });
        return;
      }
      if (checkClientDurableKeys(rawBody)) {
        sendJson(res, 400, { error: 'client-supplied durable identity fields are prohibited' });
        return;
      }

      const updated = persistence.appendVersion(ownerPair, match.reportId, rawBody as ComposeReportContentInput);
      sendJson(res, 201, { data: updated });
      return;
    }

    // 9. GET /api/reports/artifacts/:reportId/supersession
    if (match.reportId && match.isSupersession && (method === 'GET' || method === 'HEAD')) {
      const chain = persistence.supersessionChain(ownerPair, match.reportId);
      sendJson(res, 200, { data: { current: chain.current, history: chain.history } });
      return;
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    const status = mapPersistenceErrorStatus(err);
    const errorMsg =
      status === 404
        ? 'report-not-found'
        : status === 409
          ? 'report-already-superseded'
          : status === 400
            ? 'invalid-report-content'
            : status === 503
              ? 'persistence-unavailable'
              : 'reports-transport-error';
    sendJson(res, status, { error: errorMsg });
  }
}
