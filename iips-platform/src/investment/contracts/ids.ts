/**
 * IID-0 — branded identifiers.
 *
 * Three identity levels, never conflated (design of record, Part II §R-1 and Part III §E):
 *   issuer    the legal entity that publishes financial statements
 *   security  a tradable instrument issued by that entity (usually one ISIN)
 *   listing   a security as listed on one exchange, in one series, in one instrument class
 *
 * A sector-reference identifier (`Banking-H1` …) is NOT any of these and is rejected explicitly.
 * Nothing here performs I/O; every function is a pure parser or validator.
 */

export type IssuerId = string & { readonly __brand: 'IssuerId' };
export type SecurityId = string & { readonly __brand: 'SecurityId' };
export type ListingId = string & { readonly __brand: 'ListingId' };
export type PositionKey = string & { readonly __brand: 'PositionKey' };

export type IssuerKeyBasis = 'CIN' | 'EQUITY_ISIN';

export type IdErrorCode =
  | 'EMPTY'
  | 'SECTOR_REFERENCE_NOT_A_COMPANY'
  | 'UNKNOWN_ISSUER_PREFIX'
  | 'UNKNOWN_SECURITY_PREFIX'
  | 'UNKNOWN_LISTING_PREFIX'
  | 'INVALID_ISIN_FORMAT'
  | 'INVALID_ISIN_CHECK_DIGIT'
  | 'INVALID_CIN_FORMAT'
  | 'INCOMPLETE_LISTING_ID'
  | 'INVALID_LISTING_EXCHANGE'
  | 'INVALID_LISTING_SYMBOL'
  | 'INVALID_LISTING_SERIES'
  | 'INVALID_INSTRUMENT_TYPE'
  | 'INVALID_POSITION_KEY';

export class IdError extends Error {
  constructor(message: string, readonly code: IdErrorCode, readonly input: string) {
    super(message);
    this.name = 'IdError';
  }
}

function fail(code: IdErrorCode, input: string, message: string): never {
  throw new IdError(message, code, input);
}

/**
 * Sector-reference identifiers as emitted by the frozen sector engines
 * (`${sector}-H1` in `frontend/server/executive-transport.ts`) and by NP-12 populations.
 * They denote a sector-analytics placeholder, never an issuer.
 */
const SECTOR_REFERENCE_PATTERN = /^[A-Za-z][A-Za-z &.\-]*-(?:H|R|REF)\d{1,4}$/i;

export function isSectorReferenceId(value: string): boolean {
  return typeof value === 'string' && SECTOR_REFERENCE_PATTERN.test(value.trim());
}

export function assertNotSectorReference(value: string, what: string): void {
  if (isSectorReferenceId(value)) {
    fail(
      'SECTOR_REFERENCE_NOT_A_COMPANY',
      value,
      `${what} must identify a real entity; "${value}" is a sector reference and can never be used as one`,
    );
  }
}

/* ------------------------------------------------------------------ ISIN */

const ISIN_PATTERN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

/** Expand an ISIN body to its Luhn digit string (letters become two digits: A=10 … Z=35). */
function expandIsinBody(body: string): string {
  let out = '';
  for (const ch of body) {
    if (ch >= '0' && ch <= '9') out += ch;
    else out += String(ch.toUpperCase().charCodeAt(0) - 55);
  }
  return out;
}

/** Luhn check digit for a digit string, with the rightmost payload digit doubled. */
export function luhnCheckDigit(digits: string): number {
  let sum = 0;
  let double = true;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) fail('INVALID_ISIN_FORMAT', digits, 'Luhn input must be numeric');
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    double = !double;
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

export function isValidIsin(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const isin = value.trim().toUpperCase();
  if (!ISIN_PATTERN.test(isin)) return false;
  const expected = luhnCheckDigit(expandIsinBody(isin.slice(0, 11)));
  return expected === Number(isin[11]);
}

export function assertValidIsin(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) fail('EMPTY', String(value), 'ISIN is required');
  const isin = value.trim().toUpperCase();
  if (!ISIN_PATTERN.test(isin)) {
    fail('INVALID_ISIN_FORMAT', isin, `"${isin}" is not a 12-character ISIN`);
  }
  if (!isValidIsin(isin)) {
    fail('INVALID_ISIN_CHECK_DIGIT', isin, `"${isin}" fails the ISIN check digit`);
  }
  return isin;
}

/* ------------------------------------------------------------------- CIN */

/**
 * MCA Company Identification Number: 21 characters, structurally validated.
 * Listing status (1) + NIC-2004 industry (5) + state (2) + incorporation year (4)
 * + company type (3) + registration number (6). There is no check digit, so a CIN that
 * passes structurally is still confirmed against the eligible roster before use.
 */
const CIN_PATTERN = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

export function isValidCin(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return CIN_PATTERN.test(value.trim().toUpperCase());
}

export function assertValidCin(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) fail('EMPTY', String(value), 'CIN is required');
  const cin = value.trim().toUpperCase();
  if (!CIN_PATTERN.test(cin)) fail('INVALID_CIN_FORMAT', cin, `"${cin}" is not a 21-character CIN`);
  return cin;
}

/* ------------------------------------------------------------ identifiers */

const ISSUER_PREFIX_CIN = 'IN:CIN:';
const ISSUER_PREFIX_EQISIN = 'IN:EQISIN:';
const SECURITY_PREFIX = 'IN:ISIN:';
const LISTING_PREFIX = 'IN:';

/** `IN:CIN:U72200KA1981PLC013115` or `IN:EQISIN:INE009A01021`. */
export function parseIssuerId(value: unknown): IssuerId {
  if (typeof value !== 'string' || value.trim().length === 0) fail('EMPTY', String(value), 'issuer id is required');
  const raw = value.trim().toUpperCase();
  assertNotSectorReference(raw, 'issuer id');
  if (raw.startsWith(ISSUER_PREFIX_CIN)) {
    return `${ISSUER_PREFIX_CIN}${assertValidCin(raw.slice(ISSUER_PREFIX_CIN.length))}` as IssuerId;
  }
  if (raw.startsWith(ISSUER_PREFIX_EQISIN)) {
    return `${ISSUER_PREFIX_EQISIN}${assertValidIsin(raw.slice(ISSUER_PREFIX_EQISIN.length))}` as IssuerId;
  }
  return fail(
    'UNKNOWN_ISSUER_PREFIX',
    raw,
    `issuer id must be IN:CIN:<cin> or IN:EQISIN:<isin>, received "${raw}"`,
  );
}

export function issuerIdFromCin(cin: string): IssuerId {
  return parseIssuerId(`${ISSUER_PREFIX_CIN}${assertValidCin(cin)}`);
}

export function issuerIdFromEquityIsin(isin: string): IssuerId {
  return parseIssuerId(`${ISSUER_PREFIX_EQISIN}${assertValidIsin(isin)}`);
}

export function issuerKeyBasis(issuerId: IssuerId): IssuerKeyBasis {
  return issuerId.startsWith(ISSUER_PREFIX_CIN) ? 'CIN' : 'EQUITY_ISIN';
}

export function issuerCinOrNull(issuerId: IssuerId): string | null {
  return issuerId.startsWith(ISSUER_PREFIX_CIN) ? issuerId.slice(ISSUER_PREFIX_CIN.length) : null;
}

/** `IN:ISIN:INE009A01021`. */
export function parseSecurityId(value: unknown): SecurityId {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail('EMPTY', String(value), 'security id is required');
  }
  const raw = value.trim().toUpperCase();
  assertNotSectorReference(raw, 'security id');
  if (!raw.startsWith(SECURITY_PREFIX)) {
    fail('UNKNOWN_SECURITY_PREFIX', raw, `security id must be IN:ISIN:<isin>, received "${raw}"`);
  }
  return `${SECURITY_PREFIX}${assertValidIsin(raw.slice(SECURITY_PREFIX.length))}` as SecurityId;
}

export function securityIsin(securityId: SecurityId): string {
  return securityId.slice(SECURITY_PREFIX.length);
}

/* -------------------------------------------------------------- listings */

export const EXCHANGES = ['NSE', 'BSE'] as const;
export type Exchange = (typeof EXCHANGES)[number];

/** Series observed on the Indian exchanges. Closed: an unknown series is rejected, not guessed. */
export const LISTING_SERIES = ['EQ', 'BE', 'BZ', 'N1', 'W1', 'SM', 'IT', 'MT'] as const;
export type ListingSeries = (typeof LISTING_SERIES)[number];

/**
 * Instrument classification. Distinct instruments must never share a listing, which is why the
 * listing key carries both series and instrument type (design of record, Part III §E).
 */
export const INSTRUMENT_TYPES = [
  'EQUITY',
  'PREFERENCE',
  'DEBENTURE',
  'ETF',
  'MF_UNIT',
  'REIT_INVIT',
  'WARRANT',
  'RIGHTS_ENTITLEMENT',
  'OTHER',
] as const;
export type InstrumentType = (typeof INSTRUMENT_TYPES)[number];

export interface ListingParts {
  readonly exchange: Exchange;
  readonly symbol: string;
  readonly series: ListingSeries;
  readonly instrumentType: InstrumentType;
}

const SYMBOL_PATTERN = /^[A-Z0-9&\-]{1,32}$/;

function assertListingParts(parts: ListingParts, raw: string): ListingParts {
  if (!EXCHANGES.includes(parts.exchange)) {
    fail('INVALID_LISTING_EXCHANGE', raw, `unknown exchange "${String(parts.exchange)}"`);
  }
  if (!SYMBOL_PATTERN.test(parts.symbol)) {
    fail('INVALID_LISTING_SYMBOL', raw, `invalid listing symbol "${parts.symbol}"`);
  }
  if (!LISTING_SERIES.includes(parts.series)) {
    fail('INVALID_LISTING_SERIES', raw, `unknown series "${String(parts.series)}"`);
  }
  if (!INSTRUMENT_TYPES.includes(parts.instrumentType)) {
    fail('INVALID_INSTRUMENT_TYPE', raw, `unknown instrument type "${String(parts.instrumentType)}"`);
  }
  return parts;
}

/** Compose a listing id from its four parts. */
export function listingId(parts: ListingParts): ListingId {
  const validated = assertListingParts(
    { ...parts, symbol: parts.symbol.trim().toUpperCase() },
    JSON.stringify(parts),
  );
  return `${LISTING_PREFIX}${validated.exchange}:${validated.symbol}:${validated.series}:${validated.instrumentType}` as ListingId;
}

/**
 * Parse `IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT>`.
 *
 * A two-part form (`IN:NSE:INFY`) is rejected as INCOMPLETE rather than defaulted: defaulting the
 * series or instrument would let a preference share and its equity resolve to the same listing.
 */
export function parseListingId(value: unknown): ListingId {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail('EMPTY', String(value), 'listing id is required');
  }
  const raw = value.trim().toUpperCase();
  assertNotSectorReference(raw, 'listing id');
  const parts = raw.split(':');
  if (parts.length !== 5 || parts[0] !== 'IN') {
    fail(
      'INCOMPLETE_LISTING_ID',
      raw,
      `listing id must be IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT>, received "${raw}"`,
    );
  }
  const [, exchange, symbol, series, instrumentType] = parts as [string, string, string, string, string];
  return listingId({
    exchange: exchange as Exchange,
    symbol,
    series: series as ListingSeries,
    instrumentType: instrumentType as InstrumentType,
  });
}

export function listingParts(listing: ListingId): ListingParts {
  const [, exchange, symbol, series, instrumentType] = listing.split(':');
  return {
    exchange: exchange as Exchange,
    symbol: symbol as string,
    series: series as ListingSeries,
    instrumentType: instrumentType as InstrumentType,
  };
}

/* ----------------------------------------------------------- position key */

/** `<portfolioId>#<securityId>` — a real position, never a candidate. */
export function positionKey(portfolioId: string, securityId: SecurityId): PositionKey {
  const portfolio = typeof portfolioId === 'string' ? portfolioId.trim() : '';
  if (portfolio.length === 0 || portfolio.includes('#')) {
    fail('INVALID_POSITION_KEY', String(portfolioId), 'portfolioId must be non-empty and must not contain "#"');
  }
  return `${portfolio}#${parseSecurityId(securityId)}` as PositionKey;
}

export function parsePositionKey(value: unknown): { portfolioId: string; securityId: SecurityId } {
  if (typeof value !== 'string') fail('INVALID_POSITION_KEY', String(value), 'position key must be a string');
  const separator = value.indexOf('#');
  if (separator <= 0 || separator === value.length - 1) {
    fail('INVALID_POSITION_KEY', value, 'position key must be <portfolioId>#<securityId>');
  }
  return {
    portfolioId: value.slice(0, separator),
    securityId: parseSecurityId(value.slice(separator + 1)),
  };
}
