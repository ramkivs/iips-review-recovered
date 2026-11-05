# IRR Prompt 5 — Dhan market-data consumer boundary and identity limitation

**Status: READ-ONLY IRR CONSUMER INTEGRATED; LIVE Dhan CONSUMPTION NOT QUALIFIED.** This is an IRR-owned integration record. It is not approval to activate credentials, a claim that real Dhan connectivity works, or a change to IPD. IRR `main` and the IPD repository were not modified.

## Exact repository and dependency state

- IRR work remains on `arena/22180ef3-iips-review-recovered`. The published feature-branch commit `e1453de2cf483bf6738bb6e2c4e6ff27b8bbeec5` is preserved in its history. The branch now includes the clean merge of IRR `origin/main` at `bc0de0e…` (`6bb6f04`); no work was made directly on IRR `main`.
- The core dependency is pinned in `frontend/package.json` and `frontend/package-lock.json` to `ramkivs/iips-production-market-data#6004ff81dd1064c5b69b15fde1f3a6c4f44981a0`.
- Independent pins remain `iips-broker-import#07e86a4f2c105651f3097a96cb519f8611945e30` and `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`.
- The pinned package exports `./dhan-server` and `MarketDataTransportClient`. IRR imports only that server-side consumer contract; it does not construct provider primitives, a Dhan API client, mapping registry, or provider operational controls.

## IRR implementation boundary

- `frontend/server/user-portfolio/marketDataValuation.ts` reads only the server-owned `IIPS_MARKET_DATA_TRANSPORT_URL` and `IIPS_MARKET_DATA_TRANSPORT_TOKEN` (`MARKET_DATA_TRANSPORT_TOKEN_ENV`). It requires a valid HTTP(S) URL without embedded credentials/query data and a nonempty token. Missing or invalid configuration yields explicit unavailable outcomes. The token is passed only to the actual client as Bearer authentication; it is not returned, logged, placed in a URL, or imported by browser code.
- The consumer calls the actual pinned client routes `/v1/health` and `/v1/quotes`, validates response and canonical D01 envelope shapes, enforces a bounded wait, isolates failures per holding, and projects from persisted G-2 read data without modifying it. No quote cache, retry, historical-data call, provider implementation, or persistence write was introduced. Spot portfolio valuation has no D02 historical-data requirement.
- A quote is requested only when the persisted G-2 holding is marked `RESOLVED` / `CANONICAL_P04` and has explicit companyId, valid ISIN, and NSE/BSE listing. No company-name or symbol-only fallback is used. INR quotes only are accepted; no currency conversion is performed.
- Canonical quote envelope fields, mode, source classification, quality, lineage, `asOf`, `receivedAt`, `evaluatedAt`, and quote timestamp are retained in the read response. `CURRENT`/`STALE` are distinct from `LIVE`/`SNAPSHOT`/`PIT` mode. Partial coverage displays only a priced subtotal; complete market value is null unless every active holding is priced. Quote-derived values never replace persisted snapshot prices, market values, holdings, revisions, or contributions.
- G-2 detail uses a separate read-only `GET /api/user-portfolios/:portfolioId/valuation` route. It uses the existing ownership/binding guard and portfolio read, and it does not widen any write gate. The prior persisted fields are now explicitly labeled as imported snapshot data. The valuation view displays per-holding failures, freshness, coverage, canonical quote mode/provenance, and provider qualification disclosure.

## Exact IPD P5 identity/series limitation

Inspection of the pinned `6004ff81…` package found that the transport is present, but its current identity contract does not prove a series-level match:

1. The G-2 `G2HoldingView` has companyId, optional ISIN/listing and P04 disposition, but no persisted `securityId` or series.
2. IPD `QuoteRequest` accepts `companyId`, optional `isin`, and optional `exchangeSegment`; it has no series/securityId field.
3. The P5 quote path calls registry `resolveProviderMapping(companyId, segment, isin)`. The separate P04-backed `resolveCanonicalIdentity` is not the resolver used by `getQuote`.
4. Registry keys are normalized companyId + exchange segment + ISIN and do not include series. The Dhan normalizer omits the optional canonical envelope `securityId` and payload `securityIdentity` fields. Thus a successful quote response may not carry response-side series identity that IRR can compare with persisted P04 identity.

IRR does not change IPD or fabricate a series. The consumer therefore uses only the explicit persisted companyId + ISIN + listing request, and the returned valuation/UI disclosure states that series-level matching is not independently proven. This limitation prevents a claim of fully verified series-level identity and must be closed by an IPD-owned contract/resolution change plus corresponding evidence before treating this path as series-qualified. If stricter qualification is required, the affected holding must fail closed until that contract exists.

## Qualification and validation boundary

The exact pinned IPD health contract says process readiness does not establish live Dhan connectivity; `providerQualification` is `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` and `liveProviderConnectivity` is `NOT_CHECKED_PRE_ACCESS`. IRR preserves and displays those values. Focused tests use deterministic local synthetic HTTP fixtures to exercise the client contract only. They are not Dhan access, provider, or live-qualification evidence. No real credential, provider network call, authoritative mapping, or live quote was used or claimed.

Validation in this workspace:

- `npm test`: **129 test files passed, 1 skipped; 1,653 tests passed, 1 skipped**. This full-suite run preceded later focused assertions for response-side identity/quality and valuation-route POST refusal.
- `npm test -- --run server/user-portfolio/marketDataValuation.test.ts server/user-portfolio-transport.test.ts src/features/user-portfolios/UserPortfolioDetail.test.tsx`: **3 files, 25 tests passed** after that assertion was added.
- `npm run typecheck`: passed after the final source changes.
- `npm run build`: passed after the final source changes. Vite emitted a large-chunk advisory (2.83 MB minified JS); no build error.
- Browser-output audit: passed for executable JS and source maps; none contains the market-data URL/token variable names, server client class, or `dhan-server` import.

All transport tests use local synthetic fixtures. They do not qualify actual Dhan access. The consumer's request timeout bounds the IRR wait/result; the pinned client does not expose an AbortSignal, so the underlying fetch is not actively cancelled by IRR when that wait expires. No IRR retry or cache was added.

**No IPD files, metadata, lockfiles, branches, tags, or commits were changed.**
