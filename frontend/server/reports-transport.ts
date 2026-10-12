/**
 * NP-06 Reports HTTP boundary.
 *
 * Artifact composition, canonicalization, persistence, provenance, validation, and lifecycle logic
 * remain in the existing `reports/*` domain modules. Every exposed Reports route is owner-scoped;
 * without a separately authorized non-authentication owner binding, the transport keeps those
 * operations unavailable. No principal, tenant, or fallback identity is inferred.
 */
import type http from 'node:http';
import { respondOwnerContextUnavailable } from './owner-context-unavailable';

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

function matchRoute(path: string): ReportsRoute | null {
  const direct = REPORTS_ROUTES.get(path);
  if (direct) return direct;

  const segments = path.split('/').filter(Boolean);
  if (segments.length < 4 || segments[0] !== 'api' || segments[1] !== 'reports' || segments[2] !== 'artifacts') {
    return null;
  }
  const tail = segments.slice(4).join('/');
  const key = tail === ''
    ? '/api/reports/artifacts/:reportId'
    : `/api/reports/artifacts/:reportId/${tail}`;
  return REPORTS_ROUTES.get(key) ?? null;
}

/** Identify the Reports namespace without matching neighbouring paths by prefix accident. */
export function isReportsPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return path === '/api/reports' || path.startsWith('/api/reports/');
}

/**
 * Handle the Reports namespace.
 *
 * Known path/method validation stays available without identity. A valid Reports capability
 * returns 503 until a non-authentication ownership source is established. Domain and persistence
 * code is deliberately not invoked, so no owner-scoped data can be read or changed.
 */
export async function handleReportsRequest(
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
