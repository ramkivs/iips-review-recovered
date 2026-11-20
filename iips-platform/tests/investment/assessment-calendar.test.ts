/**
 * IID Stage 4 / L-033 — five-trading-session price freshness against the bounded IPD calendar shape
 * (`IPD-EQUITY-2026-BOUNDED@2026-11-19.2`, continuous coverage 2026-11-01..2026-11-19 for NSE_EQ/BSE_EQ).
 *
 * Session map used below, identical for both exchanges in the bounded interval:
 * OPEN 02 03 04 05 06, exceptional OPEN Sun 08, OPEN 09, holiday 10, OPEN 11 12 13, weekend 14–15,
 * OPEN 16 17 18 19; 01 and 07 are ordinary weekend closures (07/14 were mock-only, never live sessions).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { selectPrice } from '../../src/investment/assessment/margin';
import { evaluatePriceFreshness } from '../../src/investment/assessment/exchangeCalendar';
import type { ListingRecord, PriceRecord } from '../../src/investment/fundamentals/types';
import { boundedIpdBinding, boundedIpdCalendarFixture, priceCalendarBinding } from './exchangeCalendarFixtures';

const SECURITY = 'IN:ISIN:IN0000000201';

const price = (asOf: string): PriceRecord => ({
  securityId: SECURITY,
  value: 100,
  currency: 'INR',
  asOf,
  kind: 'CLOSE',
  source: 'DATASET_EOD',
  sourceRef: `eod:${asOf}`,
  adjustment: null,
});

const selection = (asOf: string, generatedAt: string, overrides: Partial<Parameters<typeof selectPrice>[0]> = {}) =>
  selectPrice({
    securityId: SECURITY,
    prices: [price(asOf)],
    corporateActions: [],
    priceCalendar: boundedIpdBinding(SECURITY, 'BSE'),
    knownAsOf: '2026-11-01T00:00:00Z',
    generatedAt,
    dataAsOf: '2026-03-31',
    ...overrides,
  });

describe('L-033 — five trading sessions, counted on the bounded IPD calendar', () => {
  test('exactly five sessions after the observation is inside the window', () => {
    // After 2026-11-11: 12, 13, 16, 17, 18 = 5 (14–15 are the weekend).
    const result = selection('2026-11-11', '2026-11-18');
    assert.equal(result.refusal, null);
    assert.equal(result.freshness.status, 'WITHIN_WINDOW');
    assert.equal(result.freshness.tradingSessionsElapsed, 5);
    assert.equal(result.freshness.calendarId, 'IPD-EQUITY-2026-BOUNDED');
    assert.equal(result.freshness.calendarVersion, '2026-11-19.2');
    assert.match(result.freshness.calendarDigest ?? '', /^sha256:[0-9a-f]{64}$/);
  });

  test('the sixth session refuses, across a holiday and a weekend', () => {
    // After 2026-11-06: exceptional Sun 08, 09, 11, 12, 13 = 5 by the 13th; the 16th is the sixth.
    const atBoundary = selection('2026-11-06', '2026-11-13');
    assert.equal(atBoundary.refusal, null);
    assert.equal(atBoundary.freshness.tradingSessionsElapsed, 5);
    const over = selection('2026-11-06', '2026-11-16');
    assert.equal(over.refusal, 'PRICE_OUTSIDE_POLICY_WINDOW');
    assert.equal(over.freshness.tradingSessionsElapsed, 6);
    assert.equal(over.observation.reason, 'PRICE_STALE');
  });

  test('the exceptional Sunday session counts; mock-only Saturdays do not', () => {
    const sunday = selection('2026-11-06', '2026-11-09');
    assert.equal(sunday.freshness.tradingSessionsElapsed, 2); // Sun 08 (Muhurat) + Mon 09
    const saturday = selection('2026-11-06', '2026-11-07');
    assert.equal(saturday.freshness.tradingSessionsElapsed, 0); // 07 was a mock, not a live session
    assert.equal(saturday.refusal, null);
  });

  test('a price dated on a holiday or weekend is refused as a non-session observation', () => {
    assert.equal(selection('2026-11-10', '2026-11-11').refusal, 'PRICE_ON_NON_SESSION_DATE'); // Diwali holiday
    assert.equal(selection('2026-11-07', '2026-11-09').refusal, 'PRICE_ON_NON_SESSION_DATE'); // mock Saturday
    assert.equal(selection('2026-11-10', '2026-11-11').freshness.reason, 'PRICE_ON_NON_SESSION_DATE');
  });

  test('an assessment on a closed date counts only sessions up to that date', () => {
    const result = selection('2026-11-13', '2026-11-15');
    assert.equal(result.refusal, null);
    assert.equal(result.freshness.tradingSessionsElapsed, 0);
  });

  test('timestamps are aged on the exchange-local date, not the UTC date', () => {
    // 2026-11-18T19:30Z is 2026-11-19 in Asia/Kolkata, so the 19th session is the sixth after 2026-11-11.
    const result = selection('2026-11-11', '2026-11-18T19:30:00Z');
    assert.equal(result.freshness.assessmentDate, '2026-11-19');
    assert.equal(result.freshness.tradingSessionsElapsed, 6);
    assert.equal(result.refusal, 'PRICE_OUTSIDE_POLICY_WINDOW');
  });

  test('NSE and BSE bindings count the same bounded sessions independently', () => {
    for (const exchange of ['NSE', 'BSE'] as const) {
      const result = selection('2026-11-11', '2026-11-18', {
        priceCalendar: boundedIpdBinding(SECURITY, exchange),
      });
      assert.equal(result.freshness.exchange, exchange);
      assert.equal(result.freshness.segment, exchange === 'NSE' ? 'NSE_EQ' : 'BSE_EQ');
      assert.equal(result.freshness.tradingSessionsElapsed, 5);
    }
  });
});

describe('L-033 — fail-closed calendar boundary', () => {
  test('no calendar binding refuses the price; there is no calendar-day fallback', () => {
    const result = selection('2026-11-18', '2026-11-19', { priceCalendar: undefined });
    assert.equal(result.refusal, 'PRICE_CALENDAR_UNAVAILABLE');
    assert.equal(result.observation.reason, 'PRICE_UNAVAILABLE');
    assert.equal(result.freshness.tradingSessionsElapsed, null);
  });

  test('a pinned identity mismatch refuses the price', () => {
    const calendar = boundedIpdCalendarFixture();
    const result = selection('2026-11-18', '2026-11-19', {
      priceCalendar: { ...boundedIpdBinding(SECURITY), calendar, expectedVersion: '1900-01-01.0' },
    });
    assert.equal(result.refusal, 'PRICE_CALENDAR_IDENTITY_MISMATCH');
  });

  test('outside continuous coverage refuses, and sparse holiday rows do not extend it', () => {
    // 2026-11-24 exists in the fixture only as sparse annual-holiday evidence; coverage ends 2026-11-19.
    const after = selection('2026-11-19', '2026-11-24');
    assert.equal(after.refusal, 'PRICE_CALENDAR_COVERAGE_UNAVAILABLE');
    const before = selection('2026-10-30', '2026-11-02', { knownAsOf: '2026-10-01T00:00:00Z' });
    assert.equal(before.refusal, 'PRICE_CALENDAR_COVERAGE_UNAVAILABLE');
  });

  test('a segment that does not belong to the bound exchange refuses', () => {
    const binding = boundedIpdBinding(SECURITY, 'BSE');
    const result = selection('2026-11-18', '2026-11-19', {
      priceCalendar: { ...binding, segment: 'NSE_EQ' },
    });
    assert.equal(result.refusal, 'PRICE_CALENDAR_MAPPING_UNAVAILABLE');
  });

  test('a binding for another security refuses', () => {
    const result = selection('2026-11-18', '2026-11-19', {
      priceCalendar: boundedIpdBinding('IN:ISIN:IN0000000301', 'BSE'),
    });
    assert.equal(result.refusal, 'PRICE_CALENDAR_MAPPING_UNAVAILABLE');
  });

  test('dataset listings verify the binding when they are supplied', () => {
    const listing: ListingRecord = {
      listingId: 'IN:BSE:500209:EQ:EQUITY',
      securityId: SECURITY,
      issuerId: 'IN:EQISIN:IN0000000201',
      exchange: 'BSE',
      symbol: '500209',
      series: 'EQ',
      instrumentType: 'EQUITY',
      effectiveFrom: '2020-01-01',
      effectiveTo: null,
    };
    const verified = selection('2026-11-18', '2026-11-19', {
      listings: [listing],
      priceCalendar: { ...boundedIpdBinding(SECURITY, 'BSE'), listingId: listing.listingId },
    });
    assert.equal(verified.refusal, null);
    const wrongExchange = selection('2026-11-18', '2026-11-19', {
      listings: [listing],
      priceCalendar: boundedIpdBinding(SECURITY, 'NSE'),
    });
    assert.equal(wrongExchange.refusal, 'PRICE_CALENDAR_MAPPING_UNAVAILABLE');
  });

  test('the calendar digest is stable for identical artifact content', () => {
    const first = evaluatePriceFreshness({
      binding: boundedIpdBinding(SECURITY),
      securityId: SECURITY,
      observationDate: '2026-11-18',
      assessmentDate: '2026-11-19',
      maxTradingSessions: 5,
    });
    const second = evaluatePriceFreshness({
      binding: priceCalendarBinding(boundedIpdCalendarFixture(), SECURITY, 'BSE'),
      securityId: SECURITY,
      observationDate: '2026-11-18',
      assessmentDate: '2026-11-19',
      maxTradingSessions: 5,
    });
    assert.equal(first.calendarDigest, second.calendarDigest);
    assert.equal(first.tradingSessionsElapsed, 1);
  });
});
