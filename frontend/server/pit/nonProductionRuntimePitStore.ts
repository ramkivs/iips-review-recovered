/**
 * IU-6 — NON-PRODUCTION RUNTIME PIT STORE COMPOSITION (IRR side).
 *
 * The IRR server reads point-in-time market data through ONE authoritative
 * IPD `PointInTimeStore`. This module decides what that one store contains in
 * the non-production runtime. It is composition only — it is not a store, not
 * a service, not a cache and not a second PIT authority.
 *
 * ---------------------------------------------------------------------------
 * WHY BOTH POPULATIONS, AND WHY ONE STORE
 * ---------------------------------------------------------------------------
 *
 * IU-6 required a choice between (A) retaining the synthetic fixture path
 * while adding a D114-backed population path, and (B) replacing the fixture
 * bootstrap with D114-backed population.
 *
 * (A) is chosen, on evidence obtained during implementation:
 *
 *   - The D114 loader emits CANONICAL_MARKET_DATA / OFFLINE_BOOTSTRAP
 *     provenance and canonical `MarketQuotePayload` / `OHLCVCandle` payloads
 *     (`ltp`, `close`, `interval`). The fixture set deliberately emits
 *     DERIVED / MOCK_FIXTURE provenance and a deliberately non-canonical
 *     `lastTradedPrice` shape. They are different, honestly-labelled things
 *     and neither can impersonate the other.
 *   - (B) would therefore change what the existing IU-3 / IU-5 assertions
 *     observe, and could only be made green by editing tests that currently
 *     pass. Those tests are correct; the fixture path they pin is a real and
 *     still-wanted deterministic path.
 *
 * So both populations live in ONE store, under DISJOINT security identities
 * (different ISINs). The store remains the sole PIT authority; nothing in IRR
 * resolves a vintage, chooses a series, or decides which record is latest.
 *
 * Neither population touches a live provider. No NSE access, no Dhan access,
 * no credentials, no network, no production persistence.
 */
import { PointInTimeStore } from 'iips-production-market-data/pit';
import { populateNonProductionD114Pit } from 'iips-production-market-data/d114-non-production';
import { appendNonProductionFixtures } from './nonProductionPitStore.js';

/**
 * Build the single authoritative IPD PIT store the non-production IRR runtime
 * serves from.
 *
 * Population order is fixed and the two populations are disjoint, so the
 * result is deterministic and order-insensitive in content.
 */
export function createNonProductionRuntimePitStore(): PointInTimeStore<unknown> {
  const store = new PointInTimeStore<unknown>();

  // 1. Real D114 ingestion, performed entirely inside IPD: IPD's own parsers,
  //    IPD's own canonical normalization, IPD's own HistoricalPitIngestionLoader,
  //    appending into this IPD store. IRR contributes no record here.
  populateNonProductionD114Pit(store);

  // 2. The retained deterministic synthetic fixture path (append-only).
  appendNonProductionFixtures(store);

  return store;
}
