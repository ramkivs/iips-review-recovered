/**
 * D-4.6 — Authoritative canonical security identity contract shared symmetrically across
 * D01 (`POST /api/dhan/quotes`) and D02 (`POST /api/dhan/historical`).
 *
 * Canonical tuple (matching W-27 / W-28 / W-15 / D114):
 *   (companyId, exchangeSegment: 'NSE_EQ' | 'BSE_EQ', securityId: 'ISIN:<12-alnum>:<series>')
 *
 * DESIGN INVARIANTS
 *   1. No silent exchange defaulting: NSE (`NSE_EQ`) and BSE (`BSE_EQ`) are distinct
 *      exchange-scoped instruments even when they share `companyId` and `isin`.
 *   2. No companyId-only or bare-ISIN ambiguity: D02 historical requests require the exact
 *      same canonical 3-tuple as D01 quote requests.
 *   3. No silent substitution on contradiction: if optional `isin`, `series`, or `exchange`
 *      fields are supplied alongside the canonical tuple and disagree with it, the request
 *      fails closed (`MALFORMED_REQUEST`) before any transport invocation.
 */

export const DHAN_EXCHANGE_SEGMENTS = ['NSE_EQ', 'BSE_EQ'] as const;
export type DhanExchangeSegment = (typeof DHAN_EXCHANGE_SEGMENTS)[number];

export const D114_SECURITY_ID_PATTERN = /^ISIN:([A-Za-z0-9]{12}):([^:\s]+)$/;
export const DHAN_ISIN_PATTERN = /^[A-Za-z0-9]{12}$/;

export interface CanonicalDhanIdentity {
  readonly companyId: string;
  readonly securityId: string;
  readonly isin: string;
  readonly series: string;
  readonly exchangeSegment: DhanExchangeSegment;
}

export type CanonicalDhanIdentityValidation =
  | ({ readonly ok: true } & CanonicalDhanIdentity)
  | {
      readonly ok: false;
      readonly code: 'MISSING_REQUIRED_FIELD' | 'MALFORMED_REQUEST';
      readonly message: string;
    };

/** Maps a listing exchange onto its governed Dhan equity exchange segment. */
export function exchangeSegmentForExchange(exchange: 'NSE' | 'BSE'): DhanExchangeSegment {
  return exchange === 'BSE' ? 'BSE_EQ' : 'NSE_EQ';
}

/** Formats the exact W-28 / D-4.6 composite identity key (`companyId|exchangeSegment|securityId`). */
export function formatCanonicalDhanIdentityKey(
  identity: Pick<CanonicalDhanIdentity, 'companyId' | 'exchangeSegment' | 'securityId'>,
): string {
  return `${identity.companyId}|${identity.exchangeSegment}|${identity.securityId}`;
}

/**
 * Validates optional `isin`, `series`, and `exchange` fields for exact coherence against an
 * already-parsed canonical `(securityId, exchangeSegment)` pair.
 */
export function validateCanonicalIdentityCoherence(params: {
  readonly isinFromSecurityId: string;
  readonly seriesFromSecurityId: string;
  readonly exchangeSegment: DhanExchangeSegment;
  readonly rawIsin: unknown;
  readonly rawSeries: unknown;
  readonly rawExchange: unknown;
}): { readonly ok: true } | { readonly ok: false; readonly code: 'MALFORMED_REQUEST'; readonly message: string } {
  const { isinFromSecurityId, seriesFromSecurityId, exchangeSegment, rawIsin, rawSeries, rawExchange } = params;

  if (rawIsin !== undefined) {
    if (typeof rawIsin !== 'string') {
      return {
        ok: false,
        code: 'MALFORMED_REQUEST',
        message: 'isin must be a 12-character ISIN when supplied.',
      };
    }
    const trimmedIsin = rawIsin.trim();
    if (trimmedIsin !== '') {
      if (!DHAN_ISIN_PATTERN.test(trimmedIsin)) {
        return {
          ok: false,
          code: 'MALFORMED_REQUEST',
          message: 'isin must be a 12-character ISIN when supplied.',
        };
      }
      if (trimmedIsin.toUpperCase() !== isinFromSecurityId.toUpperCase()) {
        return {
          ok: false,
          code: 'MALFORMED_REQUEST',
          message: `isin (${trimmedIsin.toUpperCase()}) does not match canonical securityId ISIN (${isinFromSecurityId.toUpperCase()}).`,
        };
      }
    }
  }

  if (rawSeries !== undefined) {
    if (typeof rawSeries !== 'string' || rawSeries.trim() === '') {
      return {
        ok: false,
        code: 'MALFORMED_REQUEST',
        message: 'series must be a non-empty string when supplied.',
      };
    }
    if (rawSeries.trim() !== seriesFromSecurityId) {
      return {
        ok: false,
        code: 'MALFORMED_REQUEST',
        message: `series (${rawSeries.trim()}) does not match canonical securityId series (${seriesFromSecurityId}).`,
      };
    }
  }

  if (rawExchange !== undefined) {
    if (rawExchange !== 'NSE' && rawExchange !== 'BSE') {
      return {
        ok: false,
        code: 'MALFORMED_REQUEST',
        message: 'exchange must be NSE or BSE when supplied.',
      };
    }
    if (exchangeSegmentForExchange(rawExchange) !== exchangeSegment) {
      return {
        ok: false,
        code: 'MALFORMED_REQUEST',
        message: `exchange (${rawExchange}) contradicts exchangeSegment (${exchangeSegment}).`,
      };
    }
  }

  return { ok: true };
}

/**
 * Validates the authoritative canonical identity required identically by D01 quotes and D02
 * historical requests.
 */
export function validateCanonicalDhanIdentity(
  record: Record<string, unknown>,
  operationLabel: 'quote' | 'historical data',
): CanonicalDhanIdentityValidation {
  const rawCompanyId = record.companyId;
  if (rawCompanyId !== undefined && typeof rawCompanyId !== 'string') {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'companyId must be a non-empty string.',
    };
  }
  const companyId = typeof rawCompanyId === 'string' ? rawCompanyId.trim() : '';
  if (!companyId) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: `companyId is required to request ${operationLabel}.`,
    };
  }

  const rawSecurityId = record.securityId;
  if (rawSecurityId !== undefined && typeof rawSecurityId !== 'string') {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'securityId must be a canonical D114 identity string (ISIN:<isin>:<series>).',
    };
  }
  const securityId = typeof rawSecurityId === 'string' ? rawSecurityId.trim() : '';
  if (!securityId) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: `A canonical security identity is required to request ${operationLabel} (ISIN:<isin>:<series>).`,
    };
  }

  const securityMatch = D114_SECURITY_ID_PATTERN.exec(securityId);
  if (!securityMatch) {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'The security identity is not a canonical D114 identity (expected ISIN:<isin>:<series>).',
    };
  }

  const isin = securityMatch[1]!.toUpperCase();
  const series = securityMatch[2]!;

  const rawSegment = record.exchangeSegment;
  if (rawSegment === undefined || (typeof rawSegment === 'string' && rawSegment.trim() === '')) {
    return {
      ok: false,
      code: 'MISSING_REQUIRED_FIELD',
      message: `exchangeSegment (NSE_EQ or BSE_EQ) is required to request ${operationLabel}.`,
    };
  }
  if (rawSegment !== 'NSE_EQ' && rawSegment !== 'BSE_EQ') {
    return {
      ok: false,
      code: 'MALFORMED_REQUEST',
      message: 'exchangeSegment must be NSE_EQ or BSE_EQ.',
    };
  }
  const exchangeSegment: DhanExchangeSegment = rawSegment;

  const coherence = validateCanonicalIdentityCoherence({
    isinFromSecurityId: isin,
    seriesFromSecurityId: series,
    exchangeSegment,
    rawIsin: record.isin,
    rawSeries: record.series,
    rawExchange: record.exchange,
  });
  if (!coherence.ok) {
    return coherence;
  }

  return {
    ok: true,
    companyId,
    securityId,
    isin,
    series,
    exchangeSegment,
  };
}
