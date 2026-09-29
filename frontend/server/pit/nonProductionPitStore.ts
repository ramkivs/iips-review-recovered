/**
 * Gate 43 — First non-production IRR <-> IPD integration vertical slice.
 *
 * NON-PRODUCTION IPD PIT STORE (IRR side).
 *
 * The IRR server needs a point-in-time store to read through. That store is a
 * REAL IPD `PointInTimeStore`, constructed and resolved entirely by IPD. This
 * module's only job is to POPULATE it with deterministic, clearly-labelled
 * non-production fixture records so the seam has something to serve.
 *
 * Scope and honesty of this data:
 *  - It is NOT production market data. It is not an NSE feed, not a Dhan
 *    feed, and not an output of production ingestion, none of which are in
 *    scope for this slice.
 *  - It carries no tenant, no user, and no production authority.
 *  - `qualityState` is stamped 'GOOD' by IPD's own vocabulary only as the
 *    neutral default for a synthetic record; no certification claim is made.
 *
 * IRR seeds APPEND-ONLY RECORDS and nothing else. It does not resolve
 * vintages, does not choose which record is "latest", and does not implement
 * any PIT behaviour: `PointInTimeStore.queryAsOf` and `PitReadService` do all
 * of that, inside IPD.
 */
import { PointInTimeStore } from 'iips-production-market-data/pit';
import type { CanonicalEnvelope, DataDomain } from 'iips-production-market-data/pit';

/** The single non-production security used by this slice. */
export const NON_PRODUCTION_ISIN = 'INE665A01038';
export const NON_PRODUCTION_BL = `ISIN:${NON_PRODUCTION_ISIN}:BL`;
export const NON_PRODUCTION_EQ = `ISIN:${NON_PRODUCTION_ISIN}:EQ`;

/**
 * The IPD-side company key the fixture records are admitted under. It exists
 * only because IPD's PIT key grammar is `${companyId}:${domain}[:${securityId}]`.
 *
 * It is an IPD-internal store key. It is NOT exposed on the IRR PIT contract,
 * is never derived from an IRR sector, and is never a response field. IRR
 * addresses IPD exclusively by `securityId`.
 */
const FIXTURE_IPD_COMPANY_KEY = 'SWANENERGY';

/** Deterministic non-production vintages. */
export const T1 = '2026-01-05T09:15:00.000Z';
export const T2 = '2026-02-10T11:30:00.000Z';
export const T3 = '2026-03-20T14:45:00.000Z';

function fixtureEnvelope(
  envelopeId: string,
  domain: DataDomain,
  securityId: string,
  asOf: string,
  payload: unknown,
  dataVersion: string,
): CanonicalEnvelope<unknown> {
  return {
    envelopeId,
    domain,
    mode: 'PIT',
    companyId: FIXTURE_IPD_COMPANY_KEY,
    securityId,
    payload,
    provenance: {
      // These are synthetic non-production records, so the honest
      // classification is DERIVED (not CANONICAL_MARKET_DATA and not REAL).
      // The vendor tier MOCK_FIXTURE states plainly that no real vendor feed
      // produced this record.
      sourceClassification: 'DERIVED',
      vendorTier: 'MOCK_FIXTURE',
      asOf,
      receivedAt: asOf,
      evaluatedAt: asOf,
      dataVersion,
      lineageHash: `non-production-${dataVersion}`,
      qualityState: 'GOOD',
    },
    timestamp: asOf,
    schemaVersion: '1.0.0',
  };
}

/**
 * Build a fresh, real IPD `PointInTimeStore` populated with the
 * non-production fixture set.
 *
 * BL and EQ are admitted as DISTINCT series-aware identities under one IPD
 * company key, which is what makes the series-isolation guarantee meaningful:
 * a lookup for `ISIN:INE665A01038:EQ` must never be able to reach a `BL`
 * record.
 */
export function createNonProductionPitStore(): PointInTimeStore<unknown> {
  const store = new PointInTimeStore<unknown>();

  // --- D01_QUOTES -------------------------------------------------------
  store.append(
    fixtureEnvelope(
      'np-d01-bl-1',
      'D01_QUOTES',
      NON_PRODUCTION_BL,
      T1,
      { lastTradedPrice: 512.35, currency: 'INR', series: 'BL' },
      'np-d01-bl-1',
    ),
  );
  store.append(
    fixtureEnvelope(
      'np-d01-bl-2',
      'D01_QUOTES',
      NON_PRODUCTION_BL,
      T2,
      { lastTradedPrice: 518.9, currency: 'INR', series: 'BL' },
      'np-d01-bl-2',
    ),
  );
  store.append(
    fixtureEnvelope(
      'np-d01-eq-1',
      'D01_QUOTES',
      NON_PRODUCTION_EQ,
      T1,
      { lastTradedPrice: 511.8, currency: 'INR', series: 'EQ' },
      'np-d01-eq-1',
    ),
  );
  store.append(
    fixtureEnvelope(
      'np-d01-eq-2',
      'D01_QUOTES',
      NON_PRODUCTION_EQ,
      T3,
      { lastTradedPrice: 527.4, currency: 'INR', series: 'EQ' },
      'np-d01-eq-2',
    ),
  );

  // --- D02_OHLCV --------------------------------------------------------
  store.append(
    fixtureEnvelope(
      'np-d02-bl-1',
      'D02_OHLCV',
      NON_PRODUCTION_BL,
      T1,
      { open: 510.0, high: 514.0, low: 509.0, close: 512.35, volume: 1_000_000, series: 'BL' },
      'np-d02-bl-1',
    ),
  );
  store.append(
    fixtureEnvelope(
      'np-d02-bl-2',
      'D02_OHLCV',
      NON_PRODUCTION_BL,
      T2,
      { open: 515.0, high: 520.0, low: 514.0, close: 518.9, volume: 1_200_000, series: 'BL' },
      'np-d02-bl-2',
    ),
  );
  store.append(
    fixtureEnvelope(
      'np-d02-eq-1',
      'D02_OHLCV',
      NON_PRODUCTION_EQ,
      T1,
      { open: 510.5, high: 513.0, low: 509.5, close: 511.8, volume: 900_000, series: 'EQ' },
      'np-d02-eq-1',
    ),
  );
  store.append(
    fixtureEnvelope(
      'np-d02-eq-2',
      'D02_OHLCV',
      NON_PRODUCTION_EQ,
      T3,
      { open: 523.0, high: 529.0, low: 522.0, close: 527.4, volume: 1_100_000, series: 'EQ' },
      'np-d02-eq-2',
    ),
  );

  return store;
}
