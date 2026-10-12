/**
 * G-2 durable user-portfolio HTTP boundary.
 *
 * The IPD/G24 adapter, DTOs, identity-translation boundary, revisions, provenance, and business
 * operations remain in their existing domain modules. The HTTP surfaces are owner-scoped; without
 * a separately authorized non-authentication ownership source, they stay unavailable. This module
 * does not authenticate, synthesize a principal, pass credentials upstream, or infer a tenant.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from './owner-context-unavailable';

interface UserPortfolioRoute {
  readonly methods: readonly string[];
}

const USER_PORTFOLIO_ROUTES: ReadonlyMap<string, UserPortfolioRoute> = new Map([
  ['/api/user-portfolios/context', { methods: ['GET', 'HEAD'] }],
  ['/api/user-portfolios', { methods: ['GET', 'HEAD', 'POST'] }],
  ['/api/user-portfolios/:portfolioId', { methods: ['GET', 'HEAD', 'DELETE'] }],
  ['/api/user-portfolios/:portfolioId/holdings', { methods: ['PUT'] }],
  ['/api/user-portfolios/:portfolioId/revisions', { methods: ['GET', 'HEAD'] }],
  ['/api/user-portfolios/:portfolioId/reset', { methods: ['POST'] }],
]);

function matchRoute(path: string): UserPortfolioRoute | null {
  const exact = USER_PORTFOLIO_ROUTES.get(path);
  if (exact) return exact;

  const parts = path.split('/').filter(Boolean);
  if (parts.length < 3 || parts[0] !== 'api' || parts[1] !== 'user-portfolios') return null;
  const tail = parts.slice(3).join('/');
  const key = tail === ''
    ? '/api/user-portfolios/:portfolioId'
    : `/api/user-portfolios/:portfolioId/${tail}`;
  return USER_PORTFOLIO_ROUTES.get(key) ?? null;
}

/** Exact API namespace check; `/api/user-portfoliosEVIL` is not in scope. */
export function isUserPortfolioPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/user-portfolios' || path.startsWith('/api/user-portfolios/');
}

/**
 * Keep route/method validation, then fail closed for every owner-scoped operation.
 * No request body, tenant claim, or Authorization header is read.
 */
export async function handleUserPortfolioRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  const method = req.method ?? '';
  res.setHeader('Content-Type', 'application/json');

  const route = matchRoute(path);
  if (!route) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
    return;
  }
  if (!route.methods.includes(method)) {
    res.writeHead(405, { Allow: route.methods.join(', ') });
    res.end(JSON.stringify({ error: 'method-not-allowed' }));
    return;
  }

  respondOwnerContextUnavailable(res);
}
