/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * PIT TRANSPORT (IRR side).
 *
 * A deliberately thin local non-production HTTP surface for the PIT read
 * boundary. It exists so the boundary is addressable the same way IRR's other
 * application routes are, without introducing a production-grade transport
 * stack, an external service, OIDC or network infrastructure.
 *
 * ROUTE COLLISION AVOIDANCE — this is the whole reason this file is separate:
 *
 *     /api/company/:id      -> :id is a SECTOR, returns the frozen engine
 *                              snapshot. UNTOUCHED by this file.
 *     /api/pit/market-data  -> addressed by securityId, returns an IPD PIT
 *                              record. New, distinct, PIT-specific.
 *
 * The two routes share no identifier semantics and no response contract.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { queryPitAsOf } from './pit/pitReadBoundary.js';
import type { PitReadPort } from './pit/pitReadPort.js';
import type { PitReadRequest, PitReadResult } from './pit/pitReadContract.js';

/** The distinct PIT route. Never `/api/company/:id`. */
export const PIT_MARKET_DATA_ROUTE = '/api/pit/market-data';

const REQUIRED_PARAMS = ['securityId', 'domain', 'asOf'] as const;

type RequiredParam = (typeof REQUIRED_PARAMS)[number];

interface DuplicateParamMiss {
  readonly status: 404;
  readonly body: { readonly found: false; readonly reason: 'INVALID_IDENTITY' | 'INVALID_DOMAIN' | 'INVALID_ASOF' };
}

function paramMiss(param: RequiredParam): DuplicateParamMiss {
  const reason =
    param === 'securityId' ? 'INVALID_IDENTITY' : param === 'domain' ? 'INVALID_DOMAIN' : 'INVALID_ASOF';
  return { status: 404, body: { found: false, reason } };
}

/**
 * Extract the three mandatory parameters.
 *
 * A repeated parameter is a fail-closed condition, not a "take the last one"
 * condition: ambiguity in the request must never be resolved by guesswork.
 */
function extractParams(url: string): { request: PitReadRequest } | DuplicateParamMiss {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    return paramMiss('securityId');
  }

  const search = new URLSearchParams(url.slice(queryStart + 1));
  const collected: Record<RequiredParam, string> = { securityId: '', domain: '', asOf: '' };

  for (const param of REQUIRED_PARAMS) {
    const values = search.getAll(param);
    if (values.length === 0) return paramMiss(param);
    if (values.length > 1) return paramMiss(param);
    const value = values[0];
    if (typeof value !== 'string') return paramMiss(param);
    collected[param] = value;
  }

  return { request: { securityId: collected.securityId, domain: collected.domain, asOf: collected.asOf } };
}

/** Map a boundary result onto the minimal non-production HTTP status set. */
function statusFor(result: PitReadResult): number {
  if (result.found) return 200;
  if (result.reason === 'NOT_FOUND') return 404;
  if (result.reason === 'AMBIGUOUS') return 404;
  return 404;
}

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) });
  res.end(payload);
}

/**
 * Handle a PIT read request.
 *
 * Only GET is served. Any other method on this route is rejected with 405 so
 * that the PIT surface cannot be driven by a write verb.
 *
 * IU-5 / D3 — the route is matched by EXACT equality against the path portion
 * of the request, never by prefix. A prefix test would capture unrelated paths
 * that merely begin with the same characters — `/api/pit/market-dataEVIL` and
 * `/api/pit/market-data/../company/banking` both satisfy
 * `startsWith(PIT_MARKET_DATA_ROUTE)` — and would then be served a PIT hit on a
 * route that does not exist. Anything that is not precisely the PIT route is a
 * 404 and is never handed to the PIT boundary.
 */
export async function handlePitReadRequest(
  req: IncomingMessage,
  res: ServerResponse,
  port: PitReadPort,
): Promise<void> {
  const rawUrl = req.url ?? '';
  const path = rawUrl.split('?')[0];

  if (path !== PIT_MARKET_DATA_ROUTE) {
    writeJson(res, 404, { found: false, reason: 'NOT_FOUND' });
    return;
  }

  if (req.method !== 'GET') {
    writeJson(res, 405, { found: false, reason: 'INVALID_IDENTITY' });
    return;
  }

  const extracted = extractParams(rawUrl);
  if ('request' in extracted) {
    const result = await queryPitAsOf(port, extracted.request);
    writeJson(res, statusFor(result), result);
    return;
  }

  writeJson(res, extracted.status, extracted.body);
}