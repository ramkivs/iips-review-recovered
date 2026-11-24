/**
 * D-4.6 — Browser-side canonical security-identity builders shared identically by
 * `DhanQuotes` (D01) and `DhanHistorical` (D02).
 *
 * Pure browser module: zero server imports, zero provider logic. Enforces the exact same
 * `(companyId, securityId: 'ISIN:<12-alnum>:<series>', exchangeSegment: 'NSE_EQ' | 'BSE_EQ')`
 * canonical identity tuple required by the IRR server boundary.
 */
import type { DhanHistoricalRequest, DhanQuoteRequest } from '../../api/dhanMarketData';
import type { InstrumentSearchResult } from '../../api/dhanIdentity';

export type DhanExchangeSegment = 'NSE_EQ' | 'BSE_EQ';
export type DhanHistoricalInterval = DhanHistoricalRequest['interval'];

/** The canonical identity grammar, matching the server-side validation pattern. */
export const D114_SECURITY_ID_PATTERN = /^ISIN:([A-Za-z0-9]{12}):([^:\s]+)$/;

/** Maps a listing exchange onto the canonical Dhan equity exchange segment. */
export function exchangeSegmentFor(exchange: 'NSE' | 'BSE'): DhanExchangeSegment {
  return exchange === 'BSE' ? 'BSE_EQ' : 'NSE_EQ';
}

export interface BrowserCanonicalIdentity {
  readonly companyId: string;
  readonly securityId: string;
  readonly exchangeSegment: DhanExchangeSegment;
}

/**
 * Validates and builds the canonical 3-tuple `(companyId, securityId, exchangeSegment)`.
 *
 * Returns null if any required field is missing, empty, or malformed — never silently
 * defaulting `exchangeSegment` between NSE_EQ and BSE_EQ.
 */
export function buildCanonicalDhanIdentity(
  companyId: string,
  securityId: string,
  exchangeSegment: DhanExchangeSegment | '',
): BrowserCanonicalIdentity | null {
  const company = companyId.trim();
  const security = securityId.trim();
  if (!company) return null;
  if (!D114_SECURITY_ID_PATTERN.test(security)) return null;
  if (exchangeSegment !== 'NSE_EQ' && exchangeSegment !== 'BSE_EQ') return null;
  return {
    companyId: company,
    securityId: security,
    exchangeSegment,
  };
}

/**
 * Extracts a coherent canonical identity from an instrument-search row.
 *
 * Only `QUALIFIED` results whose `result.exchange` matches `row.exchange` are admissible.
 */
export function canonicalIdentityFromSearchRow(
  row: InstrumentSearchResult,
): BrowserCanonicalIdentity | null {
  if (row.result.status !== 'QUALIFIED') return null;
  if (row.result.exchange !== row.exchange) return null;
  return buildCanonicalDhanIdentity(
    row.result.companyId,
    row.result.securityIdentity.securityId,
    exchangeSegmentFor(row.exchange),
  );
}

/**
 * Builds the canonical D01 quote request. Returns null unless all three canonical identity
 * fields `(companyId, securityId, exchangeSegment)` are valid.
 */
export function buildDhanQuoteRequest(
  companyId: string,
  securityId: string,
  exchangeSegment: DhanExchangeSegment | '',
): DhanQuoteRequest | null {
  return buildCanonicalDhanIdentity(companyId, securityId, exchangeSegment);
}

/**
 * Builds the canonical D02 historical request. Returns null unless all three canonical
 * identity fields `(companyId, securityId, exchangeSegment)` are valid and any optional
 * `isin` agrees with `securityId`.
 */
export function buildDhanHistoricalRequest(
  companyId: string,
  securityId: string,
  exchangeSegment: DhanExchangeSegment | '',
  interval: DhanHistoricalInterval,
  fromDate: string,
  toDate: string,
  isin?: string,
): DhanHistoricalRequest | null {
  const identity = buildCanonicalDhanIdentity(companyId, securityId, exchangeSegment);
  if (identity === null) return null;
  const match = D114_SECURITY_ID_PATTERN.exec(identity.securityId);
  if (!match) return null;
  const securityIsin = match[1]!.toUpperCase();

  if (isin !== undefined && isin.trim() !== '') {
    const normalizedIsin = isin.trim().toUpperCase();
    if (!/^[A-Z0-9]{12}$/.test(normalizedIsin) || normalizedIsin !== securityIsin) {
      return null;
    }
  }

  return {
    companyId: identity.companyId,
    securityId: identity.securityId,
    exchangeSegment: identity.exchangeSegment,
    interval,
    fromDate,
    toDate,
  };
}
