import { describe, expect, it } from 'vitest';
import {
  exchangeSegmentForExchange,
  formatCanonicalDhanIdentityKey,
  validateCanonicalDhanIdentity,
} from './dhanCanonicalIdentity';

describe('D-4.6 canonical Dhan security identity', () => {
  it('accepts valid NSE_EQ and BSE_EQ canonical 3-tuples symmetrically across D01 and D02', () => {
    const cases = [
      { companyId: 'EQ_RELIANCE_IN', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment: 'NSE_EQ' },
      { companyId: 'EQ_INFOSYS_IN', securityId: 'ISIN:INE009A01021:A', exchangeSegment: 'BSE_EQ' },
      { companyId: 'EQ_INFOSYS_IN', securityId: 'ISIN:INE009A01021:B', exchangeSegment: 'BSE_EQ' },
    ] as const;

    for (const input of cases) {
      const q = validateCanonicalDhanIdentity({ ...input }, 'quote');
      const h = validateCanonicalDhanIdentity({ ...input }, 'historical data');
      expect(q).toMatchObject({ ok: true, ...input });
      expect(h).toEqual(q);
    }
  });

  it('rejects missing companyId, securityId, or exchangeSegment symmetrically without defaulting', () => {
    const missingCases = [
      { securityId: 'ISIN:INE002A01018:EQ', exchangeSegment: 'NSE_EQ' },
      { companyId: '   ', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment: 'NSE_EQ' },
      { companyId: 'EQ_RELIANCE_IN', exchangeSegment: 'NSE_EQ' },
      { companyId: 'EQ_RELIANCE_IN', securityId: '', exchangeSegment: 'NSE_EQ' },
      { companyId: 'EQ_RELIANCE_IN', securityId: 'ISIN:INE002A01018:EQ' },
      { companyId: 'EQ_RELIANCE_IN', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment: '' },
    ];

    for (const input of missingCases) {
      const q = validateCanonicalDhanIdentity(input, 'quote');
      const h = validateCanonicalDhanIdentity(input, 'historical data');
      expect(q.ok).toBe(false);
      expect(h.ok).toBe(false);
      if (!q.ok && !h.ok) {
        expect(q.code).toBe('MISSING_REQUIRED_FIELD');
        expect(h.code).toBe('MISSING_REQUIRED_FIELD');
      }
    }
  });

  it('rejects malformed securityId and non-canonical exchangeSegment values', () => {
    const badSecurityIds = [
      'INE002A01018',
      'ISIN:INE002A01018',
      'ISIN:INE002A0101:EQ',
      'ISIN:INE002A01018:',
      'ISIN:INE002A01018:EQ:EXTRA',
      'RELIANCE',
    ];
    for (const securityId of badSecurityIds) {
      const q = validateCanonicalDhanIdentity(
        { companyId: 'EQ_RELIANCE_IN', securityId, exchangeSegment: 'NSE_EQ' },
        'quote',
      );
      const h = validateCanonicalDhanIdentity(
        { companyId: 'EQ_RELIANCE_IN', securityId, exchangeSegment: 'NSE_EQ' },
        'historical data',
      );
      expect(q.ok).toBe(false);
      expect(h.ok).toBe(false);
      if (!q.ok && !h.ok) {
        expect(q.code).toBe('MALFORMED_REQUEST');
        expect(h.code).toBe('MALFORMED_REQUEST');
      }
    }

    for (const exchangeSegment of ['NSE', 'BSE', 'BSE_A', 'BSE_B', 'MCX_FO', 'nse_eq']) {
      const q = validateCanonicalDhanIdentity(
        { companyId: 'EQ_RELIANCE_IN', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment },
        'quote',
      );
      const h = validateCanonicalDhanIdentity(
        { companyId: 'EQ_RELIANCE_IN', securityId: 'ISIN:INE002A01018:EQ', exchangeSegment },
        'historical data',
      );
      expect(q.ok).toBe(false);
      expect(h.ok).toBe(false);
      if (!q.ok && !h.ok) {
        expect(q.code).toBe('MALFORMED_REQUEST');
        expect(h.code).toBe('MALFORMED_REQUEST');
      }
    }
  });

  it('refuses cross-field contradictions (isin, series, or exchange vs canonical tuple)', () => {
    // Mismatched ISIN
    expect(
      validateCanonicalDhanIdentity(
        {
          companyId: 'EQ_RELIANCE_IN',
          securityId: 'ISIN:INE002A01018:EQ',
          exchangeSegment: 'NSE_EQ',
          isin: 'INE009A01021',
        },
        'historical data',
      ),
    ).toMatchObject({ ok: false, code: 'MALFORMED_REQUEST' });

    // Mismatched series
    expect(
      validateCanonicalDhanIdentity(
        {
          companyId: 'EQ_RELIANCE_IN',
          securityId: 'ISIN:INE002A01018:EQ',
          exchangeSegment: 'NSE_EQ',
          series: 'BE',
        },
        'quote',
      ),
    ).toMatchObject({ ok: false, code: 'MALFORMED_REQUEST' });

    // Mismatched exchange vs exchangeSegment (NSE vs BSE_EQ)
    expect(
      validateCanonicalDhanIdentity(
        {
          companyId: 'EQ_INFOSYS_IN',
          securityId: 'ISIN:INE009A01021:A',
          exchangeSegment: 'BSE_EQ',
          exchange: 'NSE',
        },
        'historical data',
      ),
    ).toMatchObject({ ok: false, code: 'MALFORMED_REQUEST' });

    // Matching optional fields succeed and normalize ISIN uppercase
    const coherent = validateCanonicalDhanIdentity(
      {
        companyId: 'EQ_INFOSYS_IN',
        securityId: 'ISIN:INE009A01021:A',
        exchangeSegment: 'BSE_EQ',
        isin: 'ine009a01021',
        series: 'A',
        exchange: 'BSE',
      },
      'historical data',
    );
    expect(coherent).toEqual({
      ok: true,
      companyId: 'EQ_INFOSYS_IN',
      securityId: 'ISIN:INE009A01021:A',
      isin: 'INE009A01021',
      series: 'A',
      exchangeSegment: 'BSE_EQ',
    });
  });

  it('preserves NSE/BSE exchange and series distinctions in canonical composite keys', () => {
    expect(exchangeSegmentForExchange('NSE')).toBe('NSE_EQ');
    expect(exchangeSegmentForExchange('BSE')).toBe('BSE_EQ');

    const nseKey = formatCanonicalDhanIdentityKey({
      companyId: 'EQ_INFOSYS_IN',
      exchangeSegment: 'NSE_EQ',
      securityId: 'ISIN:INE009A01021:EQ',
    });
    const bseAKey = formatCanonicalDhanIdentityKey({
      companyId: 'EQ_INFOSYS_IN',
      exchangeSegment: 'BSE_EQ',
      securityId: 'ISIN:INE009A01021:A',
    });
    const bseBKey = formatCanonicalDhanIdentityKey({
      companyId: 'EQ_INFOSYS_IN',
      exchangeSegment: 'BSE_EQ',
      securityId: 'ISIN:INE009A01021:B',
    });
    expect(new Set([nseKey, bseAKey, bseBKey]).size).toBe(3);
  });
});
