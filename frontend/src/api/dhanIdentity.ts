import { noAuthFetch } from '../core/network/noAuthFetch';

export type IdentityOutcome = QualifiedIdentity | UnresolvedIdentity | AmbiguousIdentity;
export interface QualifiedIdentity {
  readonly status: 'QUALIFIED';
  readonly securityIdentity: {
    readonly securityId: `ISIN:${string}:${string}`;
    readonly isin: string;
    readonly series: string;
    readonly isinAuthority: 'NON_AUTHORITATIVE';
    readonly [evidence: string]: unknown;
  };
  readonly companyId: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly isinAuthority: 'NON_AUTHORITATIVE';
  readonly [evidence: string]: unknown;
}
export interface UnresolvedIdentity {
  readonly status: 'UNRESOLVED';
  readonly reason: string;
  readonly details: string;
  readonly [evidence: string]: unknown;
}
export interface AmbiguousIdentity {
  readonly status: 'AMBIGUOUS';
  readonly reason: 'AMBIGUOUS_PROVIDER_MAPPING' | 'CONFLICTING_SERIES';
  readonly details: string;
  readonly [evidence: string]: unknown;
}
export interface InstrumentSearchResult {
  readonly symbol: string;
  readonly exchange: 'NSE' | 'BSE';
  readonly result: IdentityOutcome;
  readonly [evidence: string]: unknown;
}
export interface InstrumentSearchResponse { readonly results: readonly InstrumentSearchResult[]; readonly [evidence: string]: unknown }
export interface IdentityApiError { readonly error: { readonly code: string; readonly message: string } }
export type IdentityResponse<T> = { readonly data: T; readonly provenance: { readonly authority: 'IPD'; readonly mode: 'SNAPSHOT'; readonly dataVersion: string } };

const routes = {
  search: '/api/dhan/instruments/search',
  resolve: '/api/dhan/identity/resolve',
  qualify: '/api/dhan/identity/qualify',
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const unresolvedReasons = new Set([
  'MISSING_ISIN', 'INVALID_ISIN_SYNTAX', 'MISSING_P04_CORRESPONDENCE', 'INACTIVE_OR_MISSING_LISTING',
  'MISSING_SERIES_EVIDENCE', 'MISSING_P7_MAPPING', 'AMBIGUOUS_PROVIDER_MAPPING', 'CONFLICTING_ISIN',
  'CONFLICTING_SERIES', 'EXCHANGE_MISMATCH', 'STALE_SOURCE_EVIDENCE',
]);
function isCanonicalSecurityId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  return parts.length === 3 && parts[0] === 'ISIN' && /^[A-Za-z0-9]{12}$/.test(parts[1] ?? '') &&
    Boolean(parts[2]) && parts[2] === parts[2]?.trim();
}
function isOutcome(value: unknown): value is IdentityOutcome {
  if (!isRecord(value)) return false;
  if (value.status === 'QUALIFIED') {
    const identity = value.securityIdentity;
    return isRecord(identity) && isCanonicalSecurityId(identity.securityId) &&
      typeof identity.isin === 'string' && typeof identity.series === 'string' &&
      identity.securityId === `ISIN:${identity.isin}:${identity.series}` &&
      identity.isinAuthority === 'NON_AUTHORITATIVE' && value.isinAuthority === 'NON_AUTHORITATIVE' &&
      typeof value.companyId === 'string' && (value.exchange === 'NSE' || value.exchange === 'BSE');
  }
  if (value.status === 'UNRESOLVED') return typeof value.reason === 'string' && unresolvedReasons.has(value.reason) && typeof value.details === 'string';
  return value.status === 'AMBIGUOUS' &&
    (value.reason === 'AMBIGUOUS_PROVIDER_MAPPING' || value.reason === 'CONFLICTING_SERIES') && typeof value.details === 'string';
}
function isSearchResponse(value: unknown): value is InstrumentSearchResponse {
  return isRecord(value) && Array.isArray(value.results) && value.results.length <= 100 && value.results.every((row) =>
    isRecord(row) && typeof row.symbol === 'string' && (row.exchange === 'NSE' || row.exchange === 'BSE') && isOutcome(row.result) &&
    (row.result.status !== 'QUALIFIED' || row.result.exchange === row.exchange));
}

export class DhanIdentityApiError extends Error {
  constructor(readonly code: string, message: string, readonly status: number) { super(message); this.name = 'DhanIdentityApiError'; }
}
async function call<T>(path: string, body: unknown, validate: (value: unknown) => value is T): Promise<T> {
  let response: Response;
  try {
    response = await noAuthFetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new DhanIdentityApiError('IRR_UNAVAILABLE', 'The IRR identity service could not be reached.', 0);
  }
  let decoded: unknown;
  try { decoded = await response.json(); }
  catch { throw new DhanIdentityApiError('INVALID_RESPONSE', 'The identity service returned invalid JSON.', response.status); }
  if (!response.ok) {
    const error = isRecord(decoded) && isRecord(decoded.error) ? decoded.error : null;
    throw new DhanIdentityApiError(typeof error?.code === 'string' ? error.code : 'REQUEST_FAILED',
      typeof error?.message === 'string' ? error.message : 'The identity request failed.', response.status);
  }
  if (!isRecord(decoded) || !validate(decoded.data) || !isRecord(decoded.provenance) || decoded.provenance.authority !== 'IPD' || decoded.provenance.mode !== 'SNAPSHOT' || typeof decoded.provenance.dataVersion !== 'string') {
    throw new DhanIdentityApiError('INVALID_RESPONSE', 'The identity service returned incomplete or contradictory evidence.', response.status);
  }
  return decoded.data;
}

export function searchDhanInstruments(query: string): Promise<InstrumentSearchResponse> {
  return call(routes.search, { query }, isSearchResponse);
}
export function resolveDhanIdentity(input: { companyId: string; exchange: 'NSE' | 'BSE'; securityId: string }): Promise<IdentityOutcome> {
  return call(routes.resolve, input, isOutcome);
}
export function qualifyDhanIdentity(input: { isin?: string; exchange: 'NSE' | 'BSE'; symbol?: string }): Promise<IdentityOutcome> {
  return call(routes.qualify, input, isOutcome);
}
