/**
 * L-033 test calendars. These are test inputs, not production calendar data: the bounded IPD-shaped fixture
 * transcribes only the session statuses needed from the owner-supplied IPD extract so the counting boundary can
 * be pinned, and the July fixture exists solely to keep the synthetic assessment fixtures inside a declared
 * coverage interval. Production assessments must supply the pinned IPD artifact itself.
 */
import type {
  ExchangeSessionCalendarArtifact,
  ExchangeSessionCalendarDay,
  PriceCalendarBinding,
} from '../../src/investment/assessment/exchangeCalendar';
import type { Exchange } from '../../src/investment/contracts/ids';

type DaySpec = readonly [date: string, status: 'OPEN' | 'CLOSED', dayKind: string];

function daysFor(exchange: Exchange, specs: readonly DaySpec[]): ExchangeSessionCalendarDay[] {
  return specs.map(([date, status, dayKind]) => ({
    exchange,
    date,
    status,
    sessions:
      status === 'CLOSED'
        ? []
        : dayKind === 'EXCEPTIONAL_LIVE_SESSION'
          ? [
              { opensAt: `${date}T14:20:00+05:30`, closesAt: `${date}T15:35:00+05:30` },
              { opensAt: `${date}T15:50:00+05:30`, closesAt: `${date}T16:00:00+05:30` },
            ]
          : [
              { opensAt: `${date}T09:15:00+05:30`, closesAt: `${date}T15:35:00+05:30` },
              { opensAt: `${date}T15:50:00+05:30`, closesAt: `${date}T16:00:00+05:30` },
            ],
    dayKind,
    ...(dayKind === 'EXCEPTIONAL_LIVE_SESSION' ? { description: 'Sunday Diwali Muhurat trading' } : {}),
    ...(dayKind === 'EXCHANGE_HOLIDAY' ? { description: 'Exchange holiday' } : {}),
    source: 'owner-supplied IPD calendar extract, transcribed for L-033 tests',
  }));
}

const BOUNDED_SPECS: readonly DaySpec[] = [
  ['2026-11-01', 'CLOSED', 'ORDINARY_WEEKEND'],
  ['2026-11-02', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-03', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-04', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-05', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-06', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-07', 'CLOSED', 'ORDINARY_WEEKEND'],
  ['2026-11-08', 'OPEN', 'EXCEPTIONAL_LIVE_SESSION'],
  ['2026-11-09', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-10', 'CLOSED', 'EXCHANGE_HOLIDAY'],
  ['2026-11-11', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-12', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-13', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-14', 'CLOSED', 'ORDINARY_WEEKEND'],
  ['2026-11-15', 'CLOSED', 'ORDINARY_WEEKEND'],
  ['2026-11-16', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-17', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-18', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-11-19', 'OPEN', 'ORDINARY_TRADING_DAY'],
  // Sparse annual-holiday evidence only. It is deliberately present as a day row while continuous coverage
  // still ends on 2026-11-19, so tests can prove it does not extend coverage.
  ['2026-11-24', 'CLOSED', 'EXCHANGE_HOLIDAY'],
];

/** The owner-supplied IPD artifact's identity and bounded November coverage, in the artifact's own shape. */
export function boundedIpdCalendarFixture(): ExchangeSessionCalendarArtifact {
  return {
    schemaVersion: 1,
    id: 'IPD-EQUITY-2026-BOUNDED',
    version: '2026-11-19.2',
    reviewedBy: 'IPD automated evidence reconciliation under explicit owner-directed bounded calendar model, 2026-11-19',
    qualification: {
      asOf: '2026-11-19',
      segment: 'Cash equity exchange-wide regular/CAS/post-close session envelope',
      continuousCoverage: [
        { exchange: 'NSE', segment: 'NSE_EQ', startDate: '2026-11-01', endDate: '2026-11-19' },
        { exchange: 'BSE', segment: 'BSE_EQ', startDate: '2026-11-01', endDate: '2026-11-19' },
      ],
      outsideCoverage: 'UNKNOWN/UNAVAILABLE: only explicit rows qualify; no runtime weekday inference',
    },
    sources: [
      { id: 'NSE-HOLIDAYS-2026', exchange: 'NSE', publicationDate: '2025-12-12', url: 'https://nsearchives.nseindia.com/content/circulars/CMTR71775.pdf', retrievedOn: '2026-11-19' },
      { id: 'BSE-HOLIDAYS-2026', exchange: 'BSE', publicationDate: '2025-12-12', url: 'https://www.bseindia.com/markets/MarketInfo/DispNewNoticesCirculars.aspx?page=20251212-8', retrievedOn: '2026-11-19' },
      { id: 'NSE-MUHURAT-EQUITY', exchange: 'NSE', publicationDate: '2026-10-19', url: 'https://nsearchives.nseindia.com/content/circulars/CMTR76941.pdf', retrievedOn: '2026-11-19' },
      { id: 'BSE-MUHURAT-EQUITY', exchange: 'BSE', publicationDate: '2026-10-19', url: 'https://www.bseindia.com/downloads/UploadDocs/Notices/20261019-9/20261019-9.pdf', retrievedOn: '2026-11-19' },
    ],
    days: [...daysFor('NSE', BOUNDED_SPECS), ...daysFor('BSE', BOUNDED_SPECS)],
  };
}

const JULY_SPECS: readonly DaySpec[] = [
  ['2026-07-20', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-07-21', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-07-22', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-07-23', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-07-24', 'OPEN', 'ORDINARY_TRADING_DAY'],
  ['2026-07-25', 'CLOSED', 'ORDINARY_WEEKEND'],
];

/** Synthetic-fixture calendar covering the existing July assessment fixtures. Never a production authority. */
export function julyFixtureCalendar(): ExchangeSessionCalendarArtifact {
  return {
    schemaVersion: 1,
    id: 'TEST-EXCHANGE-CALENDAR',
    version: 'test-1',
    qualification: {
      asOf: '2026-07-25',
      segment: 'synthetic fixture coverage',
      continuousCoverage: [
        { exchange: 'NSE', segment: 'NSE_EQ', startDate: '2026-07-20', endDate: '2026-07-25' },
        { exchange: 'BSE', segment: 'BSE_EQ', startDate: '2026-07-20', endDate: '2026-07-25' },
      ],
      outsideCoverage: 'UNKNOWN/UNAVAILABLE',
    },
    sources: [{ id: 'TEST-SOURCE', url: 'urn:iips:test-calendar', retrievedOn: '2026-07-25' }],
    days: [...daysFor('NSE', JULY_SPECS), ...daysFor('BSE', JULY_SPECS)],
  };
}

export function priceCalendarBinding(
  calendar: ExchangeSessionCalendarArtifact,
  securityId: string,
  exchange: Exchange = 'NSE',
): PriceCalendarBinding {
  return {
    calendar,
    expectedId: calendar.id,
    expectedVersion: calendar.version,
    securityId,
    listingId: null,
    exchange,
    segment: exchange === 'NSE' ? 'NSE_EQ' : 'BSE_EQ',
    ...(calendar.id === 'IPD-EQUITY-2026-BOUNDED'
      ? {
          provenance: {
            repository: 'ramkivs/iips-production-market-data',
            commit: '6b50f0686e033e3d03cb8995d137e862cbf9068c',
            artifactPath: 'calendars/ipd-equity-2026.v2026-11-19.2.json',
          },
        }
      : {}),
  };
}

export function boundedIpdBinding(securityId: string, exchange: Exchange = 'BSE'): PriceCalendarBinding {
  return priceCalendarBinding(boundedIpdCalendarFixture(), securityId, exchange);
}

export function julyFixtureBinding(securityId: string, exchange: Exchange = 'NSE'): PriceCalendarBinding {
  return priceCalendarBinding(julyFixtureCalendar(), securityId, exchange);
}
