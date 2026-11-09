/**
 * G-2 durable user-portfolio HTTP boundary, integrated with IPD Direct P1 over same-host IPC.
 *
 * The admitted operations are the read-only list, detail, and revision reads (always), plus —
 * ONLY under the explicitly authorized local single-user personal path
 * (`IIPS_LOCAL_PERSONAL_USE=1`, server process environment; see
 * `docs/LOCAL-PERSONAL-USE-PERSISTENCE.md`) — the create/save/delete write routes this
 * application is authorized to expose. They use the existing `IpcUserPortfolioPort`; IPD
 * resolves the owner from its own active local binding on every call. IRR reads no request
 * identity, does not open SQLite, and sends no owner or tenant value over IPC. The server-owned
 * `IIPS_G3_IPC_BINDING_PROVISIONED` setting is only a local fail-closed precondition; IPD
 * independently validates the actual binding.
 *
 * With the personal-use setting absent or not `1`, the write routes refuse exactly as before:
 * 503 `operation-not-admitted`, no port construction, no body read. Context discovery and the
 * reset operation remain unavailable in every mode. The certified reference portfolio and all
 * other owner-scoped routes are untouched.
 *
 * Personal-path rules (unchanged from the operator-authorized 2026-11-08 decision):
 *   - only broker-observed holding fields cross from the browser; canonical identity is
 *     resolved IPD-side and asserted nowhere in IRR;
 *   - `expectedRevision` is REQUIRED on save/delete (optimistic concurrency);
 *   - the scope stays empty — never the caller's claims;
 *   - responses carry exactly the IPD-owned values (never client-recomputed).
 */
import type http from 'node:http';
import { OWNER_CONTEXT_UNAVAILABLE } from './owner-context-unavailable';
import {
  G2Error,
  isValidPortfolioId,
  isValidPortfolioName,
  validateHoldingsShape,
  validateSaveOptionsShape,
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

/** Server-owned switch for the explicitly authorized local single-user personal path. */
const LOCAL_PERSONAL_USE_SETTING = 'IIPS_LOCAL_PERSONAL_USE';
const MAX_BODY_BYTES = 256 * 1024;

function isLocalPersonalUseEnabled(env: NodeJS.ProcessEnv): boolean {
  return env[LOCAL_PERSONAL_USE_SETTING] === '1';
}

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
  return error.reason.toLowerCase().replace(/_/g, '-');
}

function parsePortfolioId(encoded: string): string | null {
  try {
    const decoded = decodeURIComponent(encoded);
    return isValidPortfolioId(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reads a bounded JSON body. Never resolves for oversized payloads. */
function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new G2Error('INVALID_REQUEST', 'The request body is too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim().length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch {
        reject(new G2Error('INVALID_REQUEST', 'The request body is not JSON.'));
      }
    });
    req.on('error', () => reject(new G2Error('INVALID_REQUEST', 'The request body could not be read.')));
  });
}

function requiredExpectedRevision(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new G2Error('INVALID_REQUEST', 'expectedRevision must be a non-negative integer.');
  }
  return value as number;
}

function optionalPortfolioName(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isValidPortfolioName(value)) {
    throw new G2Error('INVALID_REQUEST', 'portfolioName must be a non-blank string of at most 100 characters.');
  }
  return value;
}

/**
 * Serves the personal-path write routes. Callers MUST have checked the server-owned switch;
 * with it unset this function is unreachable and the historical 503 applies. Every precondition
 * checked on the read path is checked here too (binding precondition first, never request
 * identity). One HTTP request = one upstream IPC operation; no read-modify-write happens here.
 */
async function handlePersonalWrite(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  matched: MatchedRoute,
  method: string,
  head: boolean,
  env: NodeJS.ProcessEnv,
  deps: UserPortfolioTransportDeps,
): Promise<void> {
  const context = ownerContextFromBinding(readBindingPrecondition(env), env);
  if (!isOwnerContextEstablished(context)) {
    sendJson(res, 503, OWNER_CONTEXT_UNAVAILABLE, head);
    return;
  }
  const scope = {}; // empty scope — IPD resolves the owner from its own binding per call
  const port = deps.portFactory?.() ?? new IpcUserPortfolioPort({
    precondition: readBindingPrecondition(env),
    env,
  });

  try {
    const body = await readJsonBody(req);
    const payload: JsonObject = isObject(body) ? body : {};
    const path = (req.url ?? '').split('?')[0];

    // POST /api/user-portfolios — create (first batch of holdings in one transaction).
    if (path === '/api/user-portfolios' && method === 'POST') {
      const holdings = validateHoldingsShape(payload.holdings);
      if (holdings.length === 0) {
        throw new G2Error('INVALID_REQUEST', 'At least one holding is required to create the portfolio.');
      }
      const portfolioName = optionalPortfolioName(payload.portfolioName);
      const portfolio = await port.createPortfolio({
        scope,
        ...(portfolioName !== undefined ? { portfolioName } : {}),
        holdings,
      });
      sendJson(res, 201, { portfolio }, head);
      return;
    }

    // PUT /api/user-portfolios/:portfolioId/holdings — optimistic-concurrency save.
    if (matched.route.operation === 'write' && path.endsWith('/holdings') && method === 'PUT') {
      const portfolioId = parsePortfolioId(matched.portfolioId ?? '');
      if (portfolioId === null) { sendJson(res, 400, { error: 'invalid-request' }, head); return; }
      const holdings = validateHoldingsShape(payload.holdings);
      if (holdings.length === 0) {
        throw new G2Error('INVALID_REQUEST', 'At least one holding is required; remove the portfolio instead of emptying it.');
      }
      const expectedRevision = requiredExpectedRevision(payload.expectedRevision);
      const options = validateSaveOptionsShape(payload.options);
      const result = await port.saveHoldings({ scope, portfolioId, holdings, options, expectedRevision });
      sendJson(res, 200, result, head);
      return;
    }

    // DELETE /api/user-portfolios/:portfolioId — tombstone (guard required).
    if (matched.route.operation === 'detail' && method === 'DELETE') {
      const portfolioId = parsePortfolioId(matched.portfolioId ?? '');
      if (portfolioId === null) { sendJson(res, 400, { error: 'invalid-request' }, head); return; }
      const expectedRevision = requiredExpectedRevision(payload.expectedRevision);
      const result = await port.deletePortfolio({ scope, portfolioId, expectedRevision });
      sendJson(res, 200, result, head);
      return;
    }

    // Reset remains refused in every mode (not part of the authorized personal surface).
    sendNotAdmitted(res, head);
  } catch (error) {
    if (error instanceof G2Error) {
      sendJson(res, httpStatusFor(error), { error: safeErrorCode(error) }, head);
      return;
    }
    sendJson(res, 503, { error: 'upstream-unavailable' }, head);
  }
}

/**
 * Serve the admitted routes. Request headers, cookies, authorization, and query identity are
 * never used to establish scope. Bodies are read only on the personal-path write routes, and
 * only under the server-owned switch; otherwise mutating operations fail closed before
 * constructing a port or touching a request body.
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

  const env = deps.env ?? process.env;
  if (route.operation === 'context') {
    sendNotAdmitted(res, head);
    return;
  }
  if (route.operation === 'write' || (method !== 'GET' && method !== 'HEAD')) {
    if (!isLocalPersonalUseEnabled(env)) {
      sendNotAdmitted(res, head);
      return;
    }
    await handlePersonalWrite(req, res, matched, method, head, env, deps);
    return;
  }

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
    env,
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
