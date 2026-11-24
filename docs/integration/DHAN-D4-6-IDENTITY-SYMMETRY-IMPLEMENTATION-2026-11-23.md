# D-4.6 D01/D02 Exact Security-Identity Symmetry Implementation (`2026-11-23`)

**Authority:** [`docs/integration/DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`](./DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md) (§2 items 1–2, 5–6; `D-4.6` / `H-5` closure) & [`docs/integration/DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md`](./DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md) (§15, §20).

**Scope boundary:** This change closes the IRR-side `D01` (`POST /api/dhan/quotes`) vs `D02` (`POST /api/dhan/historical`) request-identity asymmetry without touching `D-4.5` (`D114/PIT` admission) or modifying the pinned IPD package (`26855625`). IPD-side `POST /v1/historical` boundary symmetry remains recorded as an IPD obligation in `DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`.

## Summary of Changes

1. **Authoritative Server Validator (`frontend/server/market-data/dhanCanonicalIdentity.ts`):**
   - Defines `CANONICAL_EXCHANGE_SEGMENTS = ['NSE_EQ', 'BSE_EQ']` and canonical `securityId` grammar `ISIN:<12-alnum>:<series>`.
   - `validateCanonicalDhanIdentity(record, subjectLabel)` enforces all three required fields (`companyId`, `exchangeSegment`, `securityId`) symmetrically with zero silent defaulting (`NSE_EQ` is never inferred when `exchangeSegment` is omitted).
   - `validateCanonicalIdentityCoherence(...)` rejects contradictory optional fields (`isin`, `series`, `exchange` vs `exchangeSegment`) before any upstream transport call is attempted.
   - `formatCanonicalDhanIdentityKey(...)` builds exact composite keys (`companyId|exchangeSegment|securityId`) aligned with `W-28` exact matching (`4,680` qualified rows across `NSE:EQ 2,390 / BSE:A 700 / BSE:B 1,590`).

2. **Symmetric IRR Route Handlers (`frontend/server/market-data/dhanMarketDataRoutes.ts`, `quoteConsumptionBoundary.ts`):**
   - `validateDhanQuoteRequest` (`D01`) and `validateDhanHistoricalRequest` (`D02`) both delegate identity validation to `validateCanonicalDhanIdentity`.
   - `validateDhanHistoricalRequest` adds strict calendar round-trip validation so impossible dates such as `2026-02-30` fail closed with `400 INVALID_DATE_RANGE` rather than rolling forward in UTC.
   - `handleDhanHistoricalRequest` forwards `{ companyId, interval, fromDate, toDate, exchangeSegment, isin }` (using pinned `26855625` typed fields, deriving `isin` from `securityId`), refuses upstream responses whose echoed `securityId` or `exchangeSegment` contradicts the request (`502 CONFLICTING_INSTRUMENT_MAPPING`, `identityFailure: true`), and echoes validated `securityId` + `exchangeSegment` on `DhanHistoricalView`.
   - `quoteConsumptionBoundary.ts` (`consumeQuotes`) enforces `validateCanonicalIdentityCoherence` on optional `isin`/`series`/`exchange` fields and refuses mismatched upstream `envelope.securityId` in `projectIpdQuoteEnvelope`, while preserving the `W-31` optional `exchangeSegment -> 'NSE_EQ'` fallback for legacy watchlist items.

3. **Shared Browser Contract & Search-Picker UI (`frontend/src/api/dhanMarketData.ts`, `frontend/src/features/dhan/dhanCanonicalIdentity.ts`, `DhanQuotes.tsx`, `DhanHistorical.tsx`):**
   - `DhanQuoteRequest` and `DhanHistoricalRequest` both require `(companyId, securityId, exchangeSegment)`.
   - `frontend/src/features/dhan/dhanCanonicalIdentity.ts` (pure browser module, zero server imports) provides shared `canonicalIdentityFromSearchRow`, `buildDhanQuoteRequest`, `buildDhanHistoricalRequest`, and `exchangeSegmentFor` across `DhanQuotes` and `DhanHistorical`.
   - `DhanHistorical.tsx` replaces free-text `companyId`/`isin` entry with the `W-15` `QUALIFIED` search-picker pattern (matching `DhanQuotes.tsx`), locks the segment selector on both surfaces to the picked `QUALIFIED` row (`row.result.exchange === row.exchange`), and adds strict calendar round-trip validation to `validateHistoricalRange`.
   - All `D-4.4` corporate-action adjustment disclosures (`StatusBadge`, `dhan-historical-adjustment-status`, `dhan-historical-unadjusted-disclosure`) and `DhanFreshnessPanel` remain intact.

## Verification

- `frontend/server/market-data/dhanCanonicalIdentity.test.ts`: symmetric `D01`/`D02` 3-tuple acceptance, missing/malformed/contradictory rejection, and `NSE_EQ:EQ` vs `BSE_EQ:A` vs `BSE_EQ:B` key isolation.
- `frontend/server/market-data/dhanMarketDataRoutes.test.ts`: symmetric route validation (`400 MISSING_REQUIRED_FIELD` / `MALFORMED_REQUEST` with `connectionAttempted: false`), cross-exchange forwarding parity, impossible-date rejection (`2026-02-30`), and `502 CONFLICTING_INSTRUMENT_MAPPING` upstream mismatch refusal.
- `frontend/server/market-data/quoteConsumptionBoundary.test.ts`: batch contradiction refusal and `projectIpdQuoteEnvelope` mismatch refusal alongside existing `W-29` and static boundary rules.
- `frontend/src/api/dhanMarketData.test.ts` & `frontend/src/features/dhan/DhanMarketData.test.tsx`: shared request builders, locked segment picker on `DhanQuotes` & `DhanHistorical`, impossible-date validation, `UNRESOLVED` refusal, and preserved `D-4.4` disclosure suites (verified via GitHub Actions `CI` workflow).
