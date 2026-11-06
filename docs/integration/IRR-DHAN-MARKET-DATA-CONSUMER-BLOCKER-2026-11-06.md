# IRR Prompt 5 — Dhan market-data consumer boundary and identity limitation

**Status: READ-ONLY IRR VALUATION UI INTEGRATED; QUOTE CONSUMPTION FAILS CLOSED ON SERIES IDENTITY; LIVE Dhan CONSUMPTION NOT QUALIFIED.** This is an IRR-owned integration record. It is not approval to activate credentials, a claim that real Dhan connectivity works, or a change to IPD. IRR `main` and the IPD repository were not modified.

## Exact repository and dependency state

- IRR work remains on `arena/22180ef3-iips-review-recovered`. The published feature-branch commit `e1453de2cf483bf6738bb6e2c4e6ff27b8bbeec5` is preserved in its history. The branch now includes the clean merge of IRR `origin/main` at `bc0de0e…` (`6bb6f04`); no work was made directly on IRR `main`.
- The core dependency is pinned in `frontend/package.json` and `frontend/package-lock.json` to `ramkivs/iips-production-market-data#6004ff81dd1064c5b69b15fde1f3a6c4f44981a0`.
- Independent pins remain `iips-broker-import#07e86a4f2c105651f3097a96cb519f8611945e30` and `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`.
- The pinned package exports `./dhan-server` and `MarketDataTransportClient`. IRR imports only that server-side consumer contract; it does not construct provider primitives, a Dhan API client, mapping registry, or provider operational controls.

## IRR implementation boundary

- `frontend/server/user-portfolio/marketDataValuation.ts` reads only the server-owned `IIPS_MARKET_DATA_TRANSPORT_URL` and `IIPS_MARKET_DATA_TRANSPORT_TOKEN` (`MARKET_DATA_TRANSPORT_TOKEN_ENV`). It requires a valid HTTP(S) URL without embedded credentials/query data and a nonempty token. Missing or invalid configuration yields explicit unavailable outcomes. The token is passed only to the actual client as Bearer authentication; it is not returned, logged, placed in a URL, or imported by browser code.
- The consumer calls only the actual pinned client `/v1/health` route. Under the verified contracts it refuses every active holding before any `/v1/quotes` request, because neither persisted G-2 nor the actual `QuoteRequest` can carry D114 series identity. No quote cache, retry, historical-data call, provider implementation, or persistence write was introduced. Spot portfolio valuation has no D02 historical-data requirement.
- `RESOLVED` / `CANONICAL_P04`, companyId, valid ISIN, and NSE/BSE listing are necessary but not sufficient for a series-level match. Every active holding returns `UNRESOLVED` / `SERIES_IDENTITY_UNAVAILABLE`; current market price, Dhan-derived market value, and quote provenance remain absent. Imported snapshot price/value and invested cost basis remain separate and untouched. No company-name or symbol-only fallback is used.
- The Prompt 5 projection/parser retains an allowlist for canonical quote envelope fields, mode, source classification, quality, lineage and timestamps. Under the current identity gate no quote or quote provenance enters the read response. `CURRENT`/`STALE` remain distinct from `LIVE`/`SNAPSHOT`/`PIT` mode if future upstream contracts establish an exact binding. Quote-derived values never replace persisted snapshot prices, market values, holdings, revisions, or contributions.
- G-2 detail uses a separate read-only `GET /api/user-portfolios/:portfolioId/valuation` route. It uses the existing ownership/binding guard and portfolio read, and it does not widen any write gate. Persisted fields are explicitly labeled as imported snapshot data. The valuation view displays per-holding failures, freshness, coverage, and provider qualification disclosure; no quote mode/provenance is currently emitted.

## Exact IPD P5 identity/series limitation and fail-closed disposition

Read-only inspection was against exact IPD commit `6004ff81dd1064c5b69b15fde1f3a6c4f44981a0`; no IPD checkout or files were changed. The exported `dhan-server` contract and implementation do not establish exact series binding:

1. IRR's actual G-2 `G2HoldingView` carries companyId, optional ISIN/listing, and P04 disposition, but no `D114SecurityIdentity`, `securityId`, or series.
2. IPD `QuoteRequest` is `{ companyId, isin?, exchangeSegment? }`; there is no series/securityId field. Its consumer transport client posts that request as-is to `/v1/quotes`.
3. IPD `getQuote()` resolves via `resolveProviderMapping(companyId, exchangeSegment, isin)`. The separate P04-backed `resolveCanonicalIdentity()` is not called by this quote path and resolves a companyId/provider mapping, not a series-aware holding identity.
4. Dhan registry keys use companyId + exchange segment + ISIN. Mapping rows may optionally carry a D114 `securityId`, but it is not part of the request key or required for registry resolution. No input series is available to compare with it.
5. The Dhan normalizer constructs D01 fields from company/listing mapping and does not emit envelope `securityId` or payload `securityIdentity`; those response properties are optional in the canonical contract. The returned quote therefore cannot independently bind a response to a persisted D114 series.
6. IRR's prior response validation could check an optional returned identity against the ISIN but could not compare its series to a persisted expected series. This is not sufficient for request-response association.

**Disposition:** exact series-level identity is not proven. IRR now returns `UNRESOLVED` with `SERIES_IDENTITY_UNAVAILABLE` for active holdings, makes no `/v1/quotes` call, and emits no quote-derived price, market value, or valuation. This is a targeted IRR-only fail-closed correction; G-2 persistence and the pinned IPD package remain unchanged. Per-holding isolation and read-only snapshot/cost-basis presentation remain intact, but the current G-2/IPD contracts provide no active holding that can be independently proven series-resolved. Do not characterize the integration as series-qualified. The IPD-owned contract/resolution change and corresponding persisted identity evidence are prerequisites to re-enabling quote consumption.

## Qualification and validation boundary

The exact pinned IPD health contract says process readiness does not establish live Dhan connectivity; `providerQualification` is `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` and `liveProviderConnectivity` is `NOT_CHECKED_PRE_ACCESS`. IRR preserves and displays those values. Focused tests use deterministic local synthetic HTTP fixtures to exercise the client contract only. They are not Dhan access, provider, or live-qualification evidence. No real credential, provider network call, authoritative mapping, or live quote was used or claimed.

Prompt 5 validation (historical baseline, before the exact-series fail-closed correction):

- `npm test`: **129 test files passed, 1 skipped; 1,653 tests passed, 1 skipped**. This full-suite run preceded later focused assertions for response-side identity/quality and valuation-route POST refusal.
- `npm test -- --run server/user-portfolio/marketDataValuation.test.ts server/user-portfolio-transport.test.ts src/features/user-portfolios/UserPortfolioDetail.test.tsx`: **3 files, 25 tests passed** after that assertion was added.
- `npm run typecheck`: passed after the final source changes.
- `npm run build`: passed after the final source changes. Vite emitted a large-chunk advisory (2.83 MB minified JS); no build error.
- Browser-output audit: passed for executable JS and source maps; none contains the market-data URL/token variable names, server client class, or `dhan-server` import.

All transport tests use local synthetic fixtures. They do not qualify actual Dhan access. The consumer's request timeout bounds the IRR wait/result; the pinned client does not expose an AbortSignal, so the underlying fetch is not actively cancelled by IRR when that wait expires. No IRR retry or cache was added.

**No IPD files, metadata, lockfiles, branches, tags, or commits were changed.**


## 2026-11-06 exact-series verification addendum

This addendum supersedes the earlier Prompt 5 statement above that a quote could be requested using only companyId + ISIN + listing while disclosing series uncertainty. Verification began on IRR branch `arena/22180ef3-iips-review-recovered` at `dd1e8a7c34c69c434e388e9a0e1b16675c3f5ee4`, the expected published Prompt 5 commit. The worktree was clean at that baseline.

The read-only source audit was pinned to IPD `6004ff81dd1064c5b69b15fde1f3a6c4f44981a0` and confirmed:

- `D114SecurityIdentity` is `{ securityId, isin, series, isinAuthority }`; the canonical ID grammar is `ISIN:<isin>:<series>`, and the source builder explicitly does not infer a series.
- Exported `QuoteRequest` is `{ companyId, isin?, exchangeSegment? }`. The exported transport client posts that object to `/v1/quotes` unchanged.
- The quote service resolves by companyId + segment + ISIN through `resolveProviderMapping`; the P04-backed `resolveCanonicalIdentity` method is not in that path and returns no series identity.
- Registry lookup keys omit series. A mapping may optionally carry `securityId`, but resolution does not require the field or compare it to a requested series.
- Although canonical D01 supports optional envelope `securityId` and payload `securityIdentity`, the pinned Dhan normalizer creates neither field. IRR could not bind a response to a persisted expected series.

The smallest IRR-only correction is in `frontend/server/user-portfolio/marketDataValuation.ts`: after validating the persisted P04 disposition, companyId, ISIN, and listing, the resolver now refuses with `SERIES_IDENTITY_UNAVAILABLE`. No `/v1/quotes` call is made. The read-only valuation keeps imported snapshot fields unchanged, sets current quote price and Dhan-derived market value to null, and exposes no quote or quote provenance. A health/readiness request remains informational only. The UI fixture and API-route tests now assert this fail-closed state. No G-2 persistence contract, broker-import path, NP04 alias, IPD source, IRR `main`, credentials, or live provider access was changed.

**Independently resolved quote preservation:** the current G-2 holding contract and pinned quote request have no field with which any active holding can be proven to a D114 series. Therefore there is no valid current series-resolved holding to keep priced. The implementation isolates the refusal per holding and does not use one holding's ISIN or response as evidence for another. An acceptance test that invents a series property/API would misrepresent the published contracts, so the focused tests instead assert the absence of series fields in both actual contracts and assert no quote request is emitted. Re-enabling any successful valuation requires an upstream persisted D114 identity plus an IPD request/resolution/response path that binds and returns that same exact identity.

Validation for this addendum (not a full-suite rerun):

- Focused tests: `npm test -- server/user-portfolio/marketDataValuation.test.ts server/user-portfolio-transport.test.ts src/features/user-portfolios/UserPortfolioDetail.test.tsx` — **3 files, 23 tests passed**.
- `npm run typecheck` — passed.
- `npm run build` — passed; Vite emitted the existing large-chunk advisory (2.83 MB minified JS).
- `git diff --check` — passed.

**Conclusion: unresolved holdings fail closed and integration remains qualified accordingly.** Series-level identity is not proven; no live Dhan qualification or certification is claimed. No IPD files, branches, tags, metadata, lockfiles, or commits were changed.
