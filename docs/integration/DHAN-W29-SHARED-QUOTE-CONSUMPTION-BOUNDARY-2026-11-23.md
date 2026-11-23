# W-29 — Shared IRR Quote-Consumption Boundary

**Work item:** W-29 · **Repository:** IRR (`ramkivs/iips-review-recovered`) · **Controlling instrument:** [Dhan Live Integration Implementation Roadmap v1.1](DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md) §6 / Appendix A
**Status:** **IMPLEMENTED — synthetic verification complete (E2). Live acceptance remains gated by M2 (not claimed).**
**Date:** 2026-11-23 · **Branch:** `arena/dd62554b-iips-review-recovered` · **Base:** `b7927de65e55fab9519eecebd1c4cb0a73717bd6` (`main`)

---

## 1. Prerequisite verification (performed before any edit)

| Prerequisite | Required by the roadmap | State found in the repository | Verdict |
|---|---|---|---|
| **W-11** — documented transport configuration | Documented names resolve on both paths | `frontend/server/market-data/dhanMarketDataTransport.ts` resolves `IIPS_MARKET_DATA_BASE_URL` + `IIPS_MARKET_DATA_TRANSPORT_TOKEN` fail-closed (loopback-only, no embedded credentials); `.env.example:65-68` documents both names and the daemon default port `8791`; `frontend/server/market-data/marketDataTransportConfig.ts` resolves the identity path from the same names; `frontend/scripts/verify-browser-bundle.mjs` is the IRR leak gate. **W-11's own acceptance remains PARTIAL on IPD's side (connected-daemon four-capability evidence outstanding)** — it is not re-opened, re-claimed or advanced here. | **Present for W-29's build use.** |
| **W-13** — canonical bid/ask representation | Absent depth is unavailable, not `0` | `projectIpdQuoteEnvelope` validates `schemaVersion: '2.0.0'` with `bid`/`ask` as `number \| null` via `isDepthPrice`, refuses a missing key and refuses a crossed book; the legacy `1.0.0` numeric form is accepted unchanged. IRR renders absence as absence. | **Present.** |
| **Healthy identity path** | A canonical identity can be turned into a transport request | `frontend/server/market-data/dhanIdentityTransport.ts` + `dhanIdentityTransport.test.ts` (13 tests, all passing) forward IPD's published `/v1/instruments/search`, `/v1/identity/resolve`, `/v1/identity/qualify`; `DhanMarketDataRoutes.validateDhanQuoteRequest` enforces the canonical D114 `ISIN:<isin>:<series>` grammar before any transport use. | **Healthy.** |

No prerequisite was bypassed, substituted or invented.

---

## 2. What was implemented

### 2.1 The boundary

`frontend/server/market-data/quoteConsumptionBoundary.ts` — **the one server-side place in IRR that consumes IPD quotes.**

It accepts a set of canonical security identities and returns one uniform projection per identity:

| Field | Meaning |
|---|---|
| `outcome` | One of the closed set `CURRENT · STALE · UNAVAILABLE · UNMAPPED · MALFORMED_IDENTITY` |
| `value` | The complete validated canonical quote, or **`null`** — never a zero-filled placeholder |
| `asOf` / `receivedAt` / `evaluatedAt` | Per-identity provider timestamps; `null` when IPD supplied none |
| `freshness` | IRR's vocabulary (`SNAPSHOT`/`STALE`/`UNAVAILABLE`) for **that identity** |
| `freshnessVerdict` / `freshnessStatus` | IPD's D01 verdict and full status, verbatim |
| `providerQualification` | IPD's own qualification, echoed — never upgraded |
| `unmapped` | Non-null **only** for `UNMAPPED`; carries IPD's identity failure code |
| `unavailable` | Non-null **only** for `UNAVAILABLE`; carries code, `connectionAttempted`, `notAttempted` |
| `malformedIdentity` | Non-null **only** for `MALFORMED_IDENTITY`; carries `MISSING_REQUIRED_FIELD`/`MALFORMED_REQUEST` |
| `provenance` | IPD's classification, data version, lineage hash, vendor tier |

`consumeQuotes(identities, deps)` returns a `QuoteConsumptionBatch` with one entry per requested identity **in request order**, per-outcome counts, `pricedCount`, `worstFreshness`, `transportConfigured`, `rateLimited` and the `concurrency` used. `consumeQuote(identity, deps)` is a one-line composition of it — there is no second request path.

### 2.2 Ownership boundary preserved

| Responsibility | Owner | How W-29 respects it |
|---|---|---|
| Provider client | IPD | IRR constructs IPD's own `MarketDataTransportClient` through the single existing factory in `dhanMarketDataTransport.ts`. No second client exists. |
| Quote normalization | IPD | The boundary validates the canonical D01 envelope shape and **refuses** a malformed one. It normalizes nothing. |
| Market-data cache | IPD | No map, store, TTL, memo or invalidation surface exists in the boundary. Every call reads IPD. |
| Freshness evaluation | IPD | Verdict, threshold, stale concession and suppression are carried verbatim; IRR applies only its own conservative presentation mapping. |
| Provider-specific behaviour | IPD | No vendor vocabulary, credential or endpoint appears in IRR's boundary. |

### 2.3 Bounded concurrency

A fixed-size worker pool (`runBounded`) dispatches at most `concurrency` quote requests in flight; results are stored by input index so ordering is independent of completion order. Default `DEFAULT_QUOTE_BATCH_CONCURRENCY = 4`; a caller may raise it to `MAX_QUOTE_BATCH_CONCURRENCY = 8`; anything below 1 clamps to 1, anything above the ceiling clamps to 8. A 200-item watchlist therefore cannot become a 200-request burst.

### 2.4 Rate-limit awareness

When IPD answers `RATE_LIMITED`, a shared flag stops the pool from dispatching any further quote request. Every remaining identity is returned as an explicit `UNAVAILABLE` with `code: 'RATE_LIMITED'`, `notAttempted: true`, `connectionAttempted: false`, and `value: null`. There is no retry, no backoff loop and no substitution of a neighbouring price.

### 2.5 Freshness joining

Each requested identity gets its **own** scoped D01 freshness read (`domain=D01_QUOTES` + `companyId` + `exchangeSegment` + `securityId`) — never one batch-level status reused. The join is a conservative correction:

- a status that says **STALE** degrades `CURRENT` → `STALE`;
- an **UNAVAILABLE/UNKNOWN** status is **not** treated as a contradiction of a provider-answered quote (IPD's D01 status describes its cache; a cache miss is not evidence against an observation), and the unknown verdict is published verbatim in `freshnessVerdict`/`freshnessStatus`;
- an unreadable status changes nothing and is reported with its failure code — it never fails the quote;
- the status can only worsen a verdict, never improve it; `LIVE` is never produced.

---

## 3. Files changed

| File | Change |
|---|---|
| `frontend/server/market-data/quoteConsumptionBoundary.ts` | **NEW** — the shared boundary: identity intake, bounded pool, rate-limit stop, freshness join, uniform projection, quote/freshness mapping and projection (moved here). |
| `frontend/server/market-data/quoteConsumptionBoundary.test.ts` | **NEW** — 40 synthetic-fixture tests (mixed batch, concurrency, rate limit, partial results, join semantics, architecture, browser bundle). |
| `frontend/server/market-data/dhanMarketDataRoutes.ts` | Quote route **migrated** to the boundary: its transport call, quote-identity construction and freshness read are removed; `Freshness`, `IRR_FRESHNESS_VOCABULARY`, `IRR_PROVIDER_QUALIFICATION`, `mapIpdFreshnessToIrrFreshness`, `DhanQuoteView` and `projectIpdQuoteEnvelope` now re-export the single boundary implementation. Historical route and its D02 freshness read are untouched (W-39 scope). |
| `frontend/server/market-data/dhanFreshnessRoutes.ts` | Documentation only: records that the freshness vocabulary is declared once here and re-exported by the boundary. |
| `frontend/scripts/verify-browser-bundle.mjs` | New prohibited class **"server-only quote-consumption boundary"**: `quoteConsumptionBoundary`, `consumeQuotes`, `consumeQuote`, `IpdMarketDataTransportConfig`, `IpdTransportConfigResolution`, `IpdFreshnessStatus`, `readIpdFreshnessStatus`, `resolveIpdMarketDataTransportConfig`, `createIpdMarketDataTransportClient`, `IRR_PROVIDER_QUALIFICATION`. |
| `frontend/scripts/verify-browser-bundle.test.mjs` | The negative fixtures now inject each of those symbols and assert rejection. |
| `frontend/tsconfig.replay-server.json` | The boundary and its test join the strict server import-closure typecheck. |

**No IPD-owned file, repository, contract or pin was modified.** No `package.json` dependency, lockfile or IPD pin changed.

---

## 4. Consumers migrated

| Consumer | Before W-29 | After W-29 |
|---|---|---|
| `POST /api/dhan/quotes` (`dhanMarketDataRoutes.ts` → `handleDhanQuotesRequest`) | Built the transport itself, called `client.getQuote`, constructed the D114 identity and read freshness inline | Delegates to `consumeQuote`; holds no transport composition and issues no request of its own |
| Browser `DhanQuotes` surface | Consumed the route's published view | Unchanged contract — the view is the boundary projection, so the migration is invisible to the browser |
| Watchlists, Personal Portfolio, Company Intelligence, Valuation, Reports, Broker Holdings | No quote consumption today | **Deliberately not integrated.** W-30…W-35 are separate work items and remain out of scope; they now have one boundary to adopt. |
| `/api/dhan/historical` | IPD historical transport | **Unchanged.** Historical consumption is W-39 and explicitly out of W-29's scope. |

`frontend/server/executive-transport.ts` mounts the existing routes unchanged; it is a dispatcher, not a consumer.

---

## 5. Verification performed

Environment note: the three private IPD packages are pinned to `github:ramkivs/iips-production-market-data`. **This sandbox's GitHub credential has no read access to that repository** (`403 Resource not accessible by integration`), so `npm ci` cannot resolve them here. To execute the W-29 suites the two real module boundaries were replaced **in a throwaway copy outside the repository** (`/tmp/run`) by (a) a minimal in-memory stand-in for the `./dhan-server` subpath exposing only the pinned client's public surface, and (b) a declaration stub for TypeScript. Nothing in the repository depends on either; the repository's own files were not altered to accommodate the sandbox.

### 5.1 Mixed-state fixture batch — PASS

One batch of five synthetic identities, one projection:

| # | Identity | Fixture behaviour | Outcome | Freshness | `asOf` | Value |
|---|---|---|---|---|---|---|
| 1 | `SYNTH_CURRENT` | 200, `GOOD`, `CURRENT`, status `GOOD` | `CURRENT` | `SNAPSHOT` | `2026-11-06T10:15:00.000Z` | `ltp 100.6` |
| 2 | `SYNTH_STALE` | 200, `STALE`, `STALE`, status `STALE` | `STALE` | `STALE` | `2026-11-06T06:00:00.000Z` | `ltp 100.6` |
| 3 | `SYNTH_UNAVAILABLE` | 502 `PROVIDER_STATUS_FAILURE` | `UNAVAILABLE` | `UNAVAILABLE` | `null` | **`null`** |
| 4 | `SYNTH_UNMAPPED` | 502 `UNRESOLVED_INSTRUMENT` | `UNMAPPED` | `UNAVAILABLE` | `null` | **`null`** |
| 5 | `SYNTH_MALFORMED` | never sent (grammar rejected) | `MALFORMED_IDENTITY` | `UNAVAILABLE` | `null` | **`null`** |

Asserted additionally: request-order correlation, per-outcome counts, `pricedCount === 2`, `worstFreshness === 'UNAVAILABLE'`, per-identity (not batch-level) `asOf`, `providerQualification === 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'` on all five, `UNMAPPED` never reported as data unavailability and vice versa, and exactly **one** quote request issued for the malformed-identity batch (the malformed identity consumed no provider budget).

### 5.2 Other targeted verification — PASS

| Claim | Evidence |
|---|---|
| No missing price is a zero | Depth-unavailable fixture yields `bid: null, ask: null` (not `0`) with `ltp` intact; malformed envelope yields `MALFORMED_RESPONSE` and `value: null`; no failed entry serializes a neighbouring price. |
| Bounded concurrency | 12 identities at concurrency 3 → 12 requests, observed max in-flight ≤ 3 and > 1; default bound honoured; `500 → 8`, `0 → 1`; a slow member does not disturb ordering. |
| Rate-limit awareness | One `RATE_LIMITED` at concurrency 1 → exactly **1** quote request, remaining entries `notAttempted: true`; a single rate-limited identity is not retried. |
| Partial results | Every requested identity yields exactly one entry; an empty batch reports `worstFreshness: 'UNAVAILABLE'`; unconfigured transport attempts nothing and says so (`NOT_CONFIGURED`). |
| Freshness association | Two identities → **two** scoped status reads; degradation-only join proven; unreadable status → `freshnessStatus: null` + failure with the quote preserved; `joinFreshness: false` skips the read. |
| `asOf` / `providerQualification` propagation | Per-identity `asOf` values distinct; qualification present on served, stale, unavailable, unmapped and malformed entries, and on the batch. |
| Architecture — one boundary | Exactly one module in `server/` calls `client.getQuote(`; `new MarketDataTransportClient(` appears only in the composition module; `createIpdMarketDataTransportClient(` callers are a four-entry allowlist each with a stated, quote-free reason. |
| Architecture — no direct transport use | `handleDhanQuotesRequest` contains no `createIpdMarketDataTransportClient`, `readIpdFreshnessStatus` or `getQuote`; it imports and calls `consumeQuote`. |
| No duplicate client / normalization / cache | The boundary contains no provider client, no normalizer, no `Map`/TTL/memo/interval, exactly one `client.getQuote(` and one `readIpdFreshnessStatus(`; the freshness vocabulary is **declared once** and re-exported. |
| Browser reachability | No production file under `frontend/src` references the boundary or the transport (browser *contract tests* may, and do, address the server declaration to pin it). |
| Browser bundle | New bundle-gate class rejects every boundary/transport symbol in emitted output and source maps; each of eleven injected negative fixtures drives the gate's **real CLI** to exit 1, the clean bundle exits 0, and a rejection names the file and a rule label but never the matched text. |

### 5.3 Test executions

| Suite | Result |
|---|---|
| `quoteConsumptionBoundary.test.ts` (new) | **40 passed** |
| `dhanMarketDataRoutes.test.ts` (migrated route contract) | **63 passed** |
| `dhanFreshnessRoutes.test.ts` | **30 passed** |
| `dhanMarketDataTransport.test.ts` | **11 passed** |
| `marketDataTransportConfig.test.ts` | **4 passed** |
| `dhanIdentityTransport.test.ts` (identity path health) | **13 passed** |
| `src/api/dhanMarketData.test.ts` (browser/server vocabulary contract) | **18 passed** |
| `node --test scripts/verify-browser-bundle.test.mjs` | **3 passed** |
| Strict TypeScript check over the boundary, its test, the migrated route, the freshness route and the transport composition | **clean** |

**Total: 182 targeted tests passed, 0 failed; typecheck clean.**

Suites that could **not** be executed in this sandbox, and why — none of them for a W-29 reason:

- `dhanHealthTransport.test.ts`, `dhanHealthState.test.ts`, `dhanVerifyConnection.test.ts`, `w11Configuration.test.ts`, `dhanNoDhanEnv.test.ts` — construct the real pinned IPD client and assert against its diagnostics/verification contract; the stand-in exposes only the quote path.
- `dhanIdentityJoined.test.tsx` — a full IPD→IRR joined run requiring IPD's `DhanMarketDataService` and provider fixtures across the private package's other subpaths.
- `src/app/dhanMarketDataRoutes.test.tsx` and the other browser route/component suites — require the `prebuild` artefact (`build:broker-import`), which needs the private packages.
- The production `vite build` + `verify:browser-bundle` gate on real output — requires the private packages.

These are all covered by the repository's CI workflow, which mints a read-scoped IPD token (`IRR_IPD_APP_CLIENT_ID` / `IRR_IPD_APP_PRIVATE_KEY`) and runs typecheck, the replay-server closure, the full Vitest suite, the zero-test guard, and the production build with the bundle gate. **The PR is therefore the authoritative verification artefact for those suites.**

### 5.4 CI reconciliation (PR #625)

The first CI run (`45169391291`) failed at step 10, **"Strict governed Screen replay server import closure"**, on one defect introduced by this change: the bundle-gate test reached `scripts/verify-browser-bundle.mjs` through a dynamic `import()`, and that step rejects a JavaScript module without a declaration file (`TS7016`). The workflow's `Typecheck` step (9) had already passed, and steps 11–13 (full Vitest suite, zero-test guard, production build + bundle gate) were skipped rather than failed.

Fix: the gate is now exercised through its **real command-line entry point** with `spawnSync`, exactly as `npm run verify:browser-bundle` invokes it. This removes the untyped import, typechecks under the strict closure, and is stronger evidence — the test now asserts the exit code a build would actually receive. The affected suites were re-run locally after the fix: `quoteConsumptionBoundary` 40/40, `tsc` clean. Re-run of CI on the amended commit is recorded on the PR.

---

## 6. Explicit confirmations

- **No live Dhan request was made.** No vendor endpoint was contacted, no credential was read or resolved, and no part of the remaining authorized quote request was consumed. Every fixture is a fixed literal in-process HTTP server.
- **No IPD-owned file, repository, ref, PR or pin was modified.**
- **Out of scope and untouched:** W-39 / D02 historical consumption, historical transport or freshness, the Dhan provider client and normalizer, any new IRR cache, live Dhan qualification, M2 acceptance, and the Personal Portfolio / Watchlist / Company Intelligence / Valuation / Reports / Broker Holdings integrations.
- No `git fetch`, `pull`, `checkout`, `switch`, `merge`, `rebase`, `reset` or `stash` was performed; the branch was created from the stated base and only additive/edited working-tree changes were made.

---

## 7. Exit-criteria assessment

> **"Exactly one place in IRR talks to IPD for quotes; every quote consumer uses it and nothing else."**

- **One place talks to IPD for quotes:** `quoteConsumptionBoundary.ts` is the only module calling `client.getQuote(`, proven structurally by the architecture test.
- **Every applicable quote consumer uses it:** the only quote consumer that exists today — the `/api/dhan/quotes` presentation route — now delegates to it and holds no transport composition. W-30…W-35 do not exist yet and are separate work items; the boundary is established for them.
- Historical consumption is W-39 and is untouched by design.

**W-29 is COMPLETE for its synthetic-implementation and E2 verification scope.** Live acceptance (E4) remains gated by M2 and is **not** claimed.

---

## 8. Remaining work and blockers

| Item | State |
|---|---|
| **Full-repository CI evidence** | Outstanding in this sandbox only (private IPD package read access, above). The PR runs it. |
| **Live acceptance of the boundary (E4)** | Gated by **M2** (provider live qualification). Not claimed. |
| **W-11 acceptance** | Unchanged at PARTIAL; nothing in W-29 advances or re-interprets it. |
| **W-39 historical extension** | Not started; depends on W-29 (now available), W-19 and D-4/W-20. |
| **W-30…W-35 consumer integrations** | Not started by design. Each adopts this boundary and carries its own prerequisites. |

### Next roadmap step

The shared boundary now **enables W-30, W-31, W-32, W-33, W-34 and W-35**. According to the roadmap's Phase 7 table, the next steps are those consumer integrations, each entering on its own dependencies:

- **W-30 (Personal Portfolio live valuation)** — the highest-value consumer, because `currentPrice` is an operator-entered field driving a "Total value"; needs W-29 ✓, W-27 and W-28.
- **W-31 (Watchlists prices)** — needs W-29 only, so it is the shortest path to a second real consumer and exercises the batch, bounded-concurrency and mixed-resolution behaviour end to end.
- **W-32 / W-33** additionally need **W-39** (historical extension) and, for W-33, W-28.
- **W-34** additionally needs W-24; **W-35** follows W-30.

Consumer live acceptance for all of them remains gated by **M2**.
