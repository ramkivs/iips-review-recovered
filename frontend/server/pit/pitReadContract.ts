/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * PIT READ CONTRACT (IRR side).
 *
 * This module is the sole definition of the request/result shape that crosses the
 * IRR -> IPD point-in-time read boundary. It is deliberately transport-neutral and
 * store-free: IRR declares what it asks for, never how the record is kept.
 *
 * Identity rule (canonical cross-platform security identity for this slice):
 *
 *     securityId = ISIN:<isin>:<series>
 *
 * Examples (DISTINCT securities, never collapsed):
 *
 *     ISIN:INE665A01038:BL
 *     ISIN:INE665A01038:EQ
 *
 * IRR addresses IPD directly by securityId. There is no companyId in this contract,
 * no tenantId, no userId, and no IRR sector/company identifier. AG-5 (the unresolved
 * IRR -> IPD company-level mapping question) is deliberately avoided, not solved.
 *
 * Fail-closed rule: an invalid, ambiguous, absent or future-dated request NEVER
 * yields a substitute value, a default series, a fabricated record or a
 * cross-series match. It yields a miss with a typed reason.
 */

/** The only market-data domains this first slice is authorised to address. */
export const PIT_READ_DOMAINS = Object.freeze(['D01_QUOTES', 'D02_OHLCV'] as const);

export type PitReadDomain = (typeof PIT_READ_DOMAINS)[number];

/** Canonical prefix of the cross-platform security identity. */
export const SECURITY_ID_PREFIX = 'ISIN';

/** Length of the ISIN component of a securityId. */
export const SECURITY_ID_ISIN_LENGTH = 12;

const ISIN_PATTERN = /^[A-Za-z0-9]{12}$/;

/** Typed, closed set of fail-closed reasons. */
export type PitReadFailureReason =
  | 'INVALID_IDENTITY'
  | 'INVALID_DOMAIN'
  | 'INVALID_ASOF'
  | 'NOT_FOUND'
  | 'AMBIGUOUS';

/**
 * The IRR-side logical request. All three fields are MANDATORY.
 * No silent defaults. No inference from an IRR sector/company identifier.
 */
export interface PitReadRequest {
  readonly securityId: string;
  readonly domain: string;
  readonly asOf: string;
}

/**
 * IPD provenance, preserved verbatim. IRR MUST NOT reinterpret IPD PIT `asOf`
 * as its own live-snapshot `asOf`; the two occupy different semantic spaces.
 */
export interface PitReadProvenance {
  readonly asOf: string;
  readonly receivedAt: string;
  readonly evaluatedAt: string;
  readonly dataVersion: string;
  readonly lineageHash: string;
  readonly qualityState: string;
}

/** Successful hit. `resolvedAsOf` is the vintage IPD actually resolved. */
export interface PitReadHit {
  readonly found: true;
  readonly securityId: string;
  readonly domain: PitReadDomain;
  readonly asOf: string;
  readonly resolvedAsOf: string;
  readonly payload: unknown;
  readonly provenance: PitReadProvenance;
}

/** Fail-closed miss. Never carries a substitute payload. */
export interface PitReadMiss {
  readonly found: false;
  readonly reason: PitReadFailureReason;
}

export type PitReadResult = PitReadHit | PitReadMiss;

/** True when `value` is a non-blank string. */
export function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Strict securityId validation.
 *
 * Accepts exactly `ISIN:<12 alphanumeric>:<non-blank series>`.
 * Rejects blank, malformed, bare-ISIN and whitespace-padded forms.
 */
export function isValidSecurityId(value: unknown): value is string {
  if (!isNonBlankString(value)) return false;
  if (value !== value.trim()) return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  const [prefix, isin, series] = parts;
  if (prefix !== SECURITY_ID_PREFIX) return false;
  if (!ISIN_PATTERN.test(isin)) return false;
  if (series.trim().length === 0) return false;
  return true;
}

/** True when `value` is one of the frozen domains for this slice. */
export function isPitReadDomain(value: unknown): value is PitReadDomain {
  return typeof value === 'string' && (PIT_READ_DOMAINS as readonly string[]).includes(value);
}

/**
 * Strict ISO-8601 UTC validation of `asOf`.
 *
 * Requires an explicit date-time with a UTC designator. A bare date, a local
 * offset and an unparseable string are all rejected so that no caller can
 * silently supply a non-UTC instant.
 */
export function isValidAsOf(value: unknown): value is string {
  if (!isNonBlankString(value)) return false;
  if (value !== value.trim()) return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

/** Epoch milliseconds of a validated asOf. Throws on an invalid value. */
export function asOfToMillis(value: string): number {
  if (!isValidAsOf(value)) {
    throw new Error(`asOfToMillis: not a valid ISO-8601 UTC instant: ${String(value)}`);
  }
  return Date.parse(value);
}

/**
 * Future-leakage guard: a resolved record must not be newer than the query.
 * Returns true when the resolution is admissible.
 */
export function isNotFutureLeakage(queryAsOf: string, resolvedAsOf: string): boolean {
  if (!isValidAsOf(queryAsOf) || !isValidAsOf(resolvedAsOf)) return false;
  return asOfToMillis(resolvedAsOf) <= asOfToMillis(queryAsOf);
}

/** Convenience miss constructors keep every failure site explicit and typed. */
export function invalidIdentity(): PitReadMiss {
  return { found: false, reason: 'INVALID_IDENTITY' };
}

export function invalidDomain(): PitReadMiss {
  return { found: false, reason: 'INVALID_DOMAIN' };
}

export function invalidAsOf(): PitReadMiss {
  return { found: false, reason: 'INVALID_ASOF' };
}

export function notFound(): PitReadMiss {
  return { found: false, reason: 'NOT_FOUND' };
}

export function ambiguous(): PitReadMiss {
  return { found: false, reason: 'AMBIGUOUS' };
}