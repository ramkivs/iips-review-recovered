/**
 * IRR-side consumer for IPD P4's published identity HTTP contract.
 *
 * Contract source: IPD PR #145, head 73768fa83c331de1bd9f51af0a6b26e5ad489ba2,
 * `docs/IPD-P4-IDENTITY-HTTP.md`. This module forwards only the three documented
 * operations and validates response coherence; it does not own or reproduce a
 * provider identity registry, resolver, or qualification algorithm. It reuses
 * IRR's existing server-owned transport configuration and keeps the bearer
 * token on this server boundary.
 */
import type http from 'node:http';
import { readMarketDataTransportConfiguration } from '../user-portfolio/marketDataValuation.js';

export const DHAN_IDENTITY_ROUTES = Object.freeze({
  search: '/v1/instruments/search',
  resolve: '/v1/identity/resolve',
  qualify: '/v1/identity/qualify',
});
export const DHAN_IDENTITY_API_ROUTES = Object.freeze({
  search: '/api/dhan/instruments/search',
  resolve: '/api/dhan/identity/resolve',
  qualify: '/api/dhan/identity/qualify',
});
export const DHAN_IDENTITY_TIMEOUT_MS = 10_000;

export type DhanIdentityErrorCode =
  | 'INVALID_REQUEST'
  | 'TRANSPORT_NOT_CONFIGURED'
  | 'TRANSPORT_AUTHENTICATION_FAILED'
  | 'TRANSPORT_TIMEOUT'
  | 'TRANSPORT_UNAVAILABLE'
  | 'IPD_REQUEST_REJECTED'
  | 'IPD_SERVER_ERROR'
  | 'MALFORMED_IPD_RESPONSE';

export interface DhanIdentitySafeError {
  readonly error: { readonly code: DhanIdentityErrorCode; readonly message: string };
}

export interface DhanIdentityTransportOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function safeError(code: DhanIdentityErrorCode, message: string): DhanIdentitySafeError {
  return { error: { code, message } };
}
function isExchange(value: unknown): value is 'NSE' | 'BSE' {
  return value === 'NSE' || value === 'BSE';
}

/** Validates only the published HTTP request shape. It never resolves identity locally. */
export function validateDhanIdentityRequest(path: string, body: unknown): string | null {
  if (!isRecord(body)) return 'Request body must be a JSON object.';
  if (path === DHAN_IDENTITY_API_ROUTES.search) {
    if (Object.keys(body).some((key) => key !== 'query')) return 'Search accepts only the query field.';
    return typeof body.query === 'string' && body.query.trim().length > 0 && body.query.length <= 100
      ? null : 'Query must be a nonempty string of at most 100 characters.';
  }
  if (path === DHAN_IDENTITY_API_ROUTES.resolve) {
    if (Object.keys(body).some((key) => !['companyId', 'exchange', 'securityId'].includes(key))) return 'Resolve accepts companyId, exchange, and securityId only.';
    if (typeof body.companyId !== 'string' || !body.companyId.trim() || body.companyId.length > 100 ||
        !isExchange(body.exchange) || typeof body.securityId !== 'string' || body.securityId.length > 100) {
      return 'Resolve requires companyId, exchange, and a securityId string.';
    }
    return null;
  }
  if (path === DHAN_IDENTITY_API_ROUTES.qualify) {
    if (Object.keys(body).some((key) => !['isin', 'exchange', 'symbol'].includes(key))) return 'Qualify accepts isin, exchange, and symbol only.';
    if (!isExchange(body.exchange) || (body.isin !== undefined && (typeof body.isin !== 'string' || body.isin.length > 100)) ||
        (body.symbol !== undefined && (typeof body.symbol !== 'string' || body.symbol.length > 100))) {
      return 'Qualify requires exchange and accepts optional isin and symbol strings.';
    }
    return null;
  }
  return 'Unknown identity operation.';
}

const UNRESOLVED_REASONS = new Set([
  'MISSING_ISIN', 'INVALID_ISIN_SYNTAX', 'MISSING_P04_CORRESPONDENCE', 'INACTIVE_OR_MISSING_LISTING',
  'MISSING_SERIES_EVIDENCE', 'MISSING_P7_MAPPING', 'AMBIGUOUS_PROVIDER_MAPPING', 'CONFLICTING_ISIN',
  'CONFLICTING_SERIES', 'EXCHANGE_MISMATCH', 'STALE_SOURCE_EVIDENCE',
]);
const AMBIGUOUS_REASONS = new Set(['AMBIGUOUS_PROVIDER_MAPPING', 'CONFLICTING_SERIES']);
function isCanonicalSecurityId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  return parts.length === 3 && parts[0] === 'ISIN' && /^[A-Za-z0-9]{12}$/.test(parts[1] ?? '') &&
    Boolean(parts[2]) && parts[2] === parts[2]?.trim();
}
function validOutcome(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.status === 'QUALIFIED') {
    const identity = value.securityIdentity;
    return isRecord(identity) && isCanonicalSecurityId(identity.securityId) &&
      typeof identity.isin === 'string' && typeof identity.series === 'string' &&
      identity.securityId === `ISIN:${identity.isin}:${identity.series}` &&
      identity.isinAuthority === 'NON_AUTHORITATIVE' &&
      typeof value.companyId === 'string' && value.companyId.length > 0 && isExchange(value.exchange) &&
      value.isinAuthority === 'NON_AUTHORITATIVE';
  }
  if (value.status === 'UNRESOLVED') return typeof value.reason === 'string' && UNRESOLVED_REASONS.has(value.reason) && typeof value.details === 'string';
  if (value.status === 'AMBIGUOUS') return typeof value.reason === 'string' && AMBIGUOUS_REASONS.has(value.reason) && typeof value.details === 'string';
  return false;
}
function responseMatchesRequest(path: string, body: unknown, value: unknown): boolean {
  if (!validIpdResponse(path, value)) return false;
  if (!isRecord(body)) return false;
  if (path === DHAN_IDENTITY_API_ROUTES.resolve && isRecord(value) && value.status === 'QUALIFIED') {
    const identity = value.securityIdentity as Record<string, unknown>;
    return typeof value.companyId === 'string' && value.companyId.trim().toUpperCase() === String(body.companyId).trim().toUpperCase() && value.exchange === body.exchange && identity.securityId === body.securityId;
  }
  if (path === DHAN_IDENTITY_API_ROUTES.qualify && isRecord(value) && value.status === 'QUALIFIED') {
    const identity = value.securityIdentity as Record<string, unknown>;
    return value.exchange === body.exchange && (typeof body.isin !== 'string' || identity.isin === body.isin.trim().toUpperCase());
  }
  if (path === DHAN_IDENTITY_API_ROUTES.search && isRecord(value) && Array.isArray(value.results)) {
    return value.results.every((row) => !isRecord(row) || !isRecord(row.result) || row.result.status !== 'QUALIFIED' || row.result.exchange === row.exchange);
  }
  return true;
}
function validIpdResponse(path: string, value: unknown): boolean {
  if (path === DHAN_IDENTITY_API_ROUTES.search) {
    if (!isRecord(value) || !Array.isArray(value.results) || value.results.length > 100) return false;
    return value.results.every((row) => isRecord(row) && typeof row.symbol === 'string' && isExchange(row.exchange) && validOutcome(row.result));
  }
  return validOutcome(value);
}

function upstreamFailure(status: number): DhanIdentitySafeError {
  if (status === 401 || status === 403) return safeError('TRANSPORT_AUTHENTICATION_FAILED', 'The IPD service rejected server authentication.');
  if (status >= 500) return safeError('IPD_SERVER_ERROR', 'The IPD identity service is unavailable.');
  return safeError('IPD_REQUEST_REJECTED', 'The IPD identity service rejected the request.');
}

/** Server-only authenticated consumer of the existing IPD P4 HTTP endpoints. */
export async function requestDhanIdentity(
  upstreamPath: string,
  body: unknown,
  options: DhanIdentityTransportOptions = {},
): Promise<{ readonly ok: true; readonly data: unknown } | { readonly ok: false; readonly status: number; readonly body: DhanIdentitySafeError }> {
  const validation = validateDhanIdentityRequest(
    upstreamPath === DHAN_IDENTITY_ROUTES.search ? DHAN_IDENTITY_API_ROUTES.search :
      upstreamPath === DHAN_IDENTITY_ROUTES.resolve ? DHAN_IDENTITY_API_ROUTES.resolve : DHAN_IDENTITY_API_ROUTES.qualify,
    body,
  );
  if (validation) return { ok: false, status: 400, body: safeError('INVALID_REQUEST', validation) };

  const config = readMarketDataTransportConfiguration(options.env ?? process.env);
  if (!config.ok) return { ok: false, status: 503, body: safeError('TRANSPORT_NOT_CONFIGURED', 'The server-side IPD transport is not configured.') };
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DHAN_IDENTITY_TIMEOUT_MS;
  let response: Response;
  try {
    response = await fetchImpl(`${config.baseUrl}${upstreamPath}`, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', authorization: `Bearer ${config.token}` },
      body: JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return { ok: false, status: 504, body: safeError('TRANSPORT_TIMEOUT', 'The IPD identity request timed out.') };
    }
    return { ok: false, status: 503, body: safeError('TRANSPORT_UNAVAILABLE', 'The IPD identity service could not be reached.') };
  }
  if (!response.ok) return { ok: false, status: response.status === 401 || response.status === 403 ? 502 : response.status >= 500 ? 503 : 502, body: upstreamFailure(response.status) };
  let decoded: unknown;
  try { decoded = await response.json(); }
  catch { return { ok: false, status: 502, body: safeError('MALFORMED_IPD_RESPONSE', 'The IPD identity service returned invalid JSON.') }; }
  const apiPath = upstreamPath === DHAN_IDENTITY_ROUTES.search ? DHAN_IDENTITY_API_ROUTES.search :
    upstreamPath === DHAN_IDENTITY_ROUTES.resolve ? DHAN_IDENTITY_API_ROUTES.resolve : DHAN_IDENTITY_API_ROUTES.qualify;
  if (!responseMatchesRequest(apiPath, body, decoded)) {
    return { ok: false, status: 502, body: safeError('MALFORMED_IPD_RESPONSE', 'The IPD identity service returned incomplete or contradictory identity evidence.') };
  }
  return { ok: true, data: decoded };
}

function sendJson(res: http.ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(value));
}
function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    req.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > 16 * 1024) { reject(new Error('too-large')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new Error('invalid-json')); }
    });
    req.on('error', reject);
  });
}

export function isDhanIdentityApiPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0];
  return Object.values(DHAN_IDENTITY_API_ROUTES).includes(path as typeof DHAN_IDENTITY_API_ROUTES[keyof typeof DHAN_IDENTITY_API_ROUTES]);
}

export async function handleDhanIdentityRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: DhanIdentityTransportOptions = {},
): Promise<void> {
  const path = (req.url ?? '').split('?')[0];
  if (!isDhanIdentityApiPath(path) || req.method !== 'POST') { sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }); return; }
  let body: unknown;
  try { body = await readBody(req); }
  catch (error) {
    const tooLarge = error instanceof Error && error.message === 'too-large';
    sendJson(res, tooLarge ? 413 : 400, { error: { code: tooLarge ? 'REQUEST_TOO_LARGE' : 'INVALID_REQUEST', message: tooLarge ? 'Request body exceeds the allowed size.' : 'Request body must be valid JSON.' } });
    return;
  }
  const upstreamPath = path === DHAN_IDENTITY_API_ROUTES.search ? DHAN_IDENTITY_ROUTES.search :
    path === DHAN_IDENTITY_API_ROUTES.resolve ? DHAN_IDENTITY_ROUTES.resolve : DHAN_IDENTITY_ROUTES.qualify;
  const outcome = await requestDhanIdentity(upstreamPath, body, options);
  if (!outcome.ok) { sendJson(res, outcome.status, outcome.body); return; }
  sendJson(res, 200, { data: outcome.data, provenance: { authority: 'IPD', mode: 'SNAPSHOT', dataVersion: 'ipd-p4-identity-http' } });
}
