/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * Typed PIT read client (IRR side).
 *
 * Mirrors the boundary contract exactly. Semantically inert: it carries a
 * securityId-addressed point-in-time request and returns what the boundary
 * returned. It never derives a securityId from an IRR sector or company
 * identifier, never defaults a series, and never substitutes a value.
 *
 * Note the deliberate asymmetry with `company.ts`, which addresses
 * `/api/company/:id` by SECTOR for the frozen engine snapshot. This client
 * addresses a different route with a different identity and must not be
 * conflated with it.
 */
import type {
  PitReadDomain,
  PitReadFailureReason,
  PitReadHit,
  PitReadProvenance,
  PitReadRequest,
} from '../server/pit/pitReadContract.js';

export type { PitReadDomain, PitReadFailureReason, PitReadHit, PitReadProvenance, PitReadRequest };

const PIT_MARKET_DATA_ROUTE = '/api/pit/market-data';

function buildQuery(request: PitReadRequest): string {
  const params = new URLSearchParams({
    securityId: request.securityId,
    domain: request.domain,
    asOf: request.asOf,
  });
  return `${PIT_MARKET_DATA_ROUTE}?${params.toString()}`;
}

/**
 * Request a series-correct point-in-time record from IPD.
 *
 * Returns the boundary result verbatim. A miss is a normal, typed outcome and
 * is returned rather than thrown, so callers cannot accidentally treat an
 * absent record as an error and fall back to live data.
 */
export async function fetchPitAsOf(request: PitReadRequest, baseUrl = ''): Promise<PitReadResult> {
  const res = await fetch(`${baseUrl}${buildQuery(request)}`);
  return (await res.json()) as PitReadResult;
}

type PitReadResult =
  | { readonly found: true; readonly securityId: string; readonly domain: PitReadDomain; readonly asOf: string; readonly resolvedAsOf: string; readonly payload: unknown; readonly provenance: PitReadProvenance }
  | { readonly found: false; readonly reason: PitReadFailureReason };

export type { PitReadResult };