/**
 * G-2 durable user-portfolio HTTP boundary, integrated with IPD Direct P1 over same-host IPC.
 *
 * The only admitted operations are read-only list, detail, and revision reads. They use the
 * existing `IpcUserPortfolioPort`; IPD resolves the owner from its own active local binding on
 * every call. IRR reads no request identity, does not open SQLite, and sends no owner or tenant
 * value over IPC. The server-owned `IIPS_G3_IPC_BINDING_PROVISIONED` setting is only a local
 * fail-closed precondition; IPD independently validates the actual binding.
 *
 * Context discovery and every create/save/reset/delete operation remain unavailable here. In
 * particular, Gate E W-1 remains authoritative: no HTTP write is forwarded or inferred as
 * authorized. The certified reference portfolio and all other owner-scoped routes are untouched.
 */
import type http from 'node:http';
import { OWNER_CONTEXT_UNAVAILABLE } from './owner-context-unavailable';
import {
  G2Error,
  isValidPortfolioId,
  type G2PortfolioSummary,
  type G2PortfolioView,
  type G2RevisionEntry,
} from './user-portfolio/userPortfolioContract.js';
import { IpcUserPortfolioPort } from './user-portfolio/ipcPortAdapter.js';
import {
  isOwnerContextEstablished,
  ownerContextFromBinding,
  readBindingPrecondition,
} from './user-portfolio/ownerContextFromBinding.js';
import type { G2Scope, UserPortfolioPort } from './user-portfolio/userPortfolioPort.js';

interface UserPortfolioRoute {
  readonly methods: readonly string[];
  readonly operation: 'context' | 'list' | 'detail' | 'revisions' | 'write';
}

const USER_PORTFOLIO_ROUTES: ReadonlyMap<string, UserPortfolioRoute> = new Map([
  ['/api/user-portfolios/context', { methods: ['GET', 'HEAD'], operation: 'context' }],
  ['/api/user-portfolios', { methods: ['GET', 'HEAD', 'POST'], operation: 'list' }],
  ['/api/user-portfolios/:portfolioId', { methods: ['GET', 'HEAD', 'DELETE'], operation: 'detail' }],
  ['/api/user-portfolios/:portfolioId/holdings', { methods: ['PUT'], operation: 'write' }],
  ['/api/user-portfolios/:portfolioId/revisions', { methods: ['GET', 'HEAD'], operation: 'revisions' }],
  ['/api/user-portfolios/:portfolioId/reset', { methods: ['POST'], operation: 'write' }],
]);

interface MatchedRoute {
  readonly route: UserPortfolioRoute;
  readonly portfolioId?: string;
}

function matchRoute(path: string): MatchedRoute | null {
  const exact = USER_PORTFOLIO_ROUTES.get(path);
  if (exact) return { route: exact };

  const parts = path.split('/').filter(Boolean);
  if (parts.length < 3 || parts[0] !== 'api' || parts[1] !== 'user-portfolios') return null;
  const tail = parts.slice(3).join('/');
  const key = tail === ''
    ? '/api/user-portfolios/:portfolioId'
    : `/api/user-portfolios/:portfolioId/${tail}`;
  const route = USER_PORTFOLIO_ROUTES.get(key);
  return route ? { route, portfolioId: parts[2] } : null;
}

/** Exact API namespace check; `/api/user-portfoliosEVIL` is not in scope. */
export function isUserPortfolioPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/user-portfolios' || path.startsWith('/api/user-portfolios/');
}

export interface UserPortfolioTransportDeps {
  /** Test seam only. Production constructs the existing IPC adapter. */
  readonly portFactory?: () => UserPortfolioPort;
  /** Server-owned environment; never sourced from the HTTP request. */
  readonly env?: NodeJS.ProcessEnv;
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
  head: boolean,
): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(head ? undefined : JSON.stringify(body));
}

function sendNotAdmitted(res: http.ServerResponse, head: boolean): void {
  sendJson(res, 503, { error: 'operation-not-admitted' }, head);
}

function httpStatusFor(error: G2Error): number {
  switch (error.reason) {
    case 'INVALID_REQUEST': return 400;
    case 'IPD_AUTH': return 401;
    case 'FORBIDDEN': return 403;
    case 'NOT_FOUND': return 404;
    case 'METHOD_NOT_ALLOWED': return 405;
    case 'REVISION_CONFLICT': return 409;
    case 'SAVE_GUARD_VIOLATION':
    case 'UPSTREAM_UNAVAILABLE':
    case 'IPD_ERROR':
      return 503;
  }
}

function safeErrorCode(error: G2Error): string {
  return error.reason.toLowerCase().replaceAll('_', '-');
}

function parsePortfolioId(encoded: string): string | null {
  try {
    const decoded = decodeURIComponent(encoded);
    return isValidPortfolioId(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Serve the admitted read-only routes. Request headers, cookies, authorization, query identity,
 * and bodies are never used to establish scope. Unsupported/mutating operations fail closed
 * before constructing a port or touching a request body.
 */
export async function handleUserPortfolioRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  deps: UserPortfolioTransportDeps = {},
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? '';
  const head = method === 'HEAD';
  const matched = matchRoute(path);

  if (!matched) {
    sendJson(res, 404, { error: 'not-found' }, head);
    return;
  }
  const { route } = matched;
  if (!route.methods.includes(method)) {
    res.writeHead(405, { Allow: route.methods.join(', '), 'Content-Type': 'application/json' });
    res.end(head ? undefined : JSON.stringify({ error: 'method-not-allowed' }));
    return;
  }

  if (route.operation === 'context' || route.operation === 'write' || (method !== 'GET' && method !== 'HEAD')) {
    sendNotAdmitted(res, head);
    return;
  }

  const env = deps.env ?? process.env;
  const context = ownerContextFromBinding(readBindingPrecondition(env), env);
  if (!isOwnerContextEstablished(context)) {
    sendJson(res, 503, OWNER_CONTEXT_UNAVAILABLE, head);
    return;
  }

  const portfolioId = route.operation === 'list'
    ? undefined
    : parsePortfolioId(matched.portfolioId ?? '');
  if (route.operation !== 'list' && portfolioId === null) {
    sendJson(res, 400, { error: 'invalid-request' }, head);
    return;
  }

  // An empty scope is intentional: tenant hints are optional and never sent. IPD resolves the
  // active owner/membership from its own binding for each IPC request.
  const scope: G2Scope = {};
  const port = deps.portFactory?.() ?? new IpcUserPortfolioPort({
    precondition: readBindingPrecondition(env),
  });

  try {
    if (route.operation === 'list') {
      const portfolios: readonly G2PortfolioSummary[] = await port.listPortfolios({ scope });
      sendJson(res, 200, { portfolios }, head);
      return;
    }
    if (route.operation === 'detail') {
      const portfolio: G2PortfolioView = await port.getPortfolio({ scope, portfolioId: portfolioId! });
      sendJson(res, 200, { portfolio }, head);
      return;
    }
    const revisions: readonly G2RevisionEntry[] = await port.revisionHistory({
      scope,
      portfolioId: portfolioId!,
    });
    sendJson(res, 200, { revisions }, head);
  } catch (error) {
    if (error instanceof G2Error) {
      sendJson(res, httpStatusFor(error), { error: safeErrorCode(error) }, head);
    } else {
      // Keep local paths, socket details and implementation errors out of the HTTP response.
      sendJson(res, 503, { error: 'upstream-unavailable' }, head);
    }
  }
}
