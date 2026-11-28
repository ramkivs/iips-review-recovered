# DHAN W-24 — IRR Trace Correlation and Bounded Ring (2026-11-26)

## 1. Status

**W-24 IRR implementation and joined synthetic verification: COMPLETE.**
**Operational acceptance: NOT PERFORMED.** No live Dhan credential, vendor request, Windows host or owner action was used. This record establishes synthetic E2 evidence only; the M4 milestone remains a separate conjunctive gate.

| Item | Status |
|---|---|
| IPD half (upstream) | **COMPLETE / VERIFIED (IPD synthetic)** — published at `0071980f8d35406ea6388edd413bde597fd65dde`; see IPD's implementation evidence and handoff below. |
| IRR dependency adoption | **COMPLETE** — `iips-production-market-data@0071980f…`; pin guards, lockfile, runbook and consumer tests agree. |
| IRR trace correlation + ring | **COMPLETE** — one `actionId` spans IRR events, IPD ring events and D01 provenance. |
| Joined E2/synthetic tests | **COMPLETE** — successful quotes, cache hits, coalesced work, failures, identifiers, eviction, safeguards and W-19/W-22/Dhan compatibility all exercised on the final branch head. |
| Full IRR regression / build | **PASS** — 3,651 passed / 1 skipped; strict typechecks, production build, browser-bundle guard and pin guard pass. |
| Published to GitHub | **COMPLETE** — branch `arena/8f80ee85-iips-review-recovered`, implementation commit `bb2bdae956fbf0fff434fda83e80d0839c42b3dd`, PR [#656](https://github.com/ramkivs/iips-review-recovered/pull/656), merged into IRR `main` as `f4b08f9924a145250cc32b549609ab92bd80f9d7`; publication record commit follows on the same branch. |
| M4 acceptance | **NOT CLAIMED** — see §8. |

## 2. Authority and upstream verification

- Authoritative IRR roadmap: `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md`, W-24 and §10.3.
- Owner decision: `docs/integration/DHAN-W24-OWNER-DECISION-PROPOSAL-2026-11-21.md`. The approved M4 interpretation is a *local* handoff: the IRR-generated `actionId` must reach IPD and be associated with IPD's local egress-attempt record. No trace header or parameter is sent to Dhan and vendor-side acknowledgement is not claimed.
- IPD implementation evidence (read from IPD `main`): `docs/evidence/DHAN-W24-IPD-IMPLEMENTATION-EVIDENCE-2026-11-26.md`.
- IPD handoff (read from IPD `main`): `docs/integration/DHAN-W24-IPD-IRR-HANDOFF-2026-11-26.md`. It records implementation PR **#203**, head `b5f7d3b1c3c6956c0dbb1d831a6745584d9c293d`, IPD `main` merge **`0071980f8d35406ea6388edd413bde597fd65dde`** (2026-11-26T08:19:06Z), and handoff merge `68249bc9755ac680b0948a7e139399e0aac6c677`. IPD `main` was re-checked at `68249bc…`.
- Interface verification: the published `iips-production-market-data/dhan-server` declaration surface and a runtime import at the pinned SHA were inspected, together with IPD source fetched at `ref=0071980`. Confirmed exports include `DhanDiagnosticRing`, `generateTraceId`, `isLowercaseUuidV4`, `mapDhanFailureToW24Category`, `validateDhanDiagnosticEvent`, `validateTraceHeaders`, `TRACE_HEADER_VERSION`, `TRACE_HEADER_ACTION`, `TRACE_VERSION_VALUE`, `W24_TRACE_CONTRACT_VERSION`, `W24_EVENT_SCHEMA_VERSION`, `W24_MAX_EVENT_BYTES`, `W24_RING_CAPACITY_IPD/IRR`, `MarketDataTransportClient.getQuote(query, traceContext)`, `.getFreshness(query, traceContext)` and `.getTraceRing(options)`, plus D01 provenance `traceId`/`correlationId`. IRR consumes these published interfaces; it does not reimplement the event schema or ring.
- Contract: **`W24_TRACE_CONTRACT_VERSION=1`**, wire headers `X-IIPS-Trace-Version: 1` and `X-IIPS-Action-Id: <lowercase-uuidv4>`. Identifiers are opaque and IPD-generated; none is derived from a credential, payload, path or secret. IPD's own 30 W-24 synthetic tests and its D-7/P4/P5 regression record are the authority for the IPD half; this record does not restate them as IRR tests.

## 3. Dependency pin adoption

| File | Change |
|---|---|
| `frontend/package.json`, `frontend/package-lock.json` | Primary runtime dependency advanced from `02786a778881e25821ecc8c62b12b33981e7e4c3` to `0071980f8d35406ea6388edd413bde597fd65dde`, with lock metadata resolved at the same commit. |
| `.ci/verify-ipd-pins.mjs` | Primary pin authority updated; sibling pins unchanged. |
| `docs/OPERATOR_RUNBOOK.md` | Pin description updated to the W-24 publication. |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts`, `frontend/server/reports/reports-persistence-integration.test.ts`, `frontend/server/user-portfolio/userPortfolioDirectP1Integration.test.ts` | Pin expectations and lineage comments re-baselined; materialized broker-import and persistence aliases unchanged. |
| `frontend/server/market-data/dhanMarketDataTransport.ts` | Transport authority comment and W-24 trace helpers use the published client contract. |

`node .ci/verify-ipd-pins.mjs` passes. Sibling pins remain `iips-broker-import@12a3d625d0ad603cb0bd9cea46bae314942ee40f` and `iips-np04-governed-persistence@2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`.

The pin advance also brings IPD's W-23 persistence and W-25 configurable-freshness diagnostics contracts. The strict diagnostics validator now requires `contractVersion: 3`, complete nine-domain `freshness.thresholds`, `freshness.overrides` and a valid `persistence` block; IRR's three synthetic diagnostics fixtures were re-baselined rather than weakening IPD validation. The joined identity test was updated for IPD's W-24 cache-hit behaviour: the UI action now produces one vendor handoff and two traced IRR actions, still carrying the requested identity and the first (STALE) observation.

## 4. IRR implementation

| Path | Role |
|---|---|
| `frontend/server/market-data/dhanTrace.ts` | Server-only W-24 module: action minting/validation, approved headers, 512-event ring instantiated from IPD's `DhanDiagnosticRing`, failure-category normalization, event recording, bounded snapshots, IPD ring reads and pure correlation view. |
| `frontend/server/market-data/dhanMarketDataTransport.ts` | `IpdTraceContext`, `readIpdTraceRing`, header propagation through IPD's own client for quote, freshness and ring reads. |
| `frontend/server/market-data/quoteConsumptionBoundary.ts` | One `ACTION_START` per IRR action; `REQUEST_ADMITTED` per admitted quote identity; `ACTION_END` with `SUCCESS`/`FAILURE`; D01 `traceId`/`correlationId` propagation; a single supplementary IPD ring read per batch; trace attached to entries and batch summaries. |
| `frontend/server/market-data/dhanMarketDataRoutes.ts` | Server-only `GET /api/dhan/trace` operator reader and removal of D01/IRR trace internals from the browser quote view. |
| `frontend/server/executive-transport.ts` | Routes `/api/dhan/trace` to the operator reader before the quote/historical surfaces. |
| `frontend/server/watchlists/watchlists-quotes.ts` | `BrowserQuoteEntry`/`toBrowserQuoteEntry()` projection: browser sees only the four legacy provenance fields. |
| `frontend/tsconfig.replay-server.json`, `frontend/scripts/verify-browser-bundle.mjs` | Strict typecheck closure and browser-bundle guard for W-24 server-only symbols and headers. |
| `frontend/server/market-data/dhanSyntheticFixtures.ts` | Complete IPD v3 diagnostics fixture blocks for the pin upgrade. |
| `frontend/server/market-data/dhanTrace.test.ts` | Joined synthetic daemon, ring, correlation, disclosure and operator-reader tests. |

### Identifier lifecycle

1. `consumeQuotes()` mints one opaque lowercase UUIDv4 `actionId` through IPD's generator (or accepts and validates an injected context). It records IRR `ACTION_START`.
2. The same context is passed to IPD's `MarketDataTransportClient.getQuote(...)` and to the supplementary `getFreshness(...)` read. IPD's client attaches `X-IIPS-Trace-Version: 1` and `X-IIPS-Action-Id: <actionId>` to the authenticated loopback request. No trace value is sent to Dhan.
3. IPD owns `workId` per shared refresh and `attemptId` per egress handoff; IRR does not invent either. Before IPD allocates them, the action id fills the two required event slots. The correlation view extracts the distinct IPD work/attempt ids from ring events carrying the same action id.
4. D01 provenance follows IPD's rule verbatim: a new quote has `traceId = correlationId = actionId`; a cache hit keeps the current `traceId` and the original producer `correlationId`; coalesced requesters keep their own `traceId` with one shared `correlationId`; failed operations publish no invented provenance.
5. IRR records `ACTION_END` with a closed failure category derived from the operation outcome. A supplementary ring read that cannot be completed is reported as `ringReadFailureCode`, never as a fabricated IPD event. For a hung/transport-failed quote attempt, the second ring read is deliberately skipped (`RING_READ_SKIPPED_TRANSPORT_FAILURE`) so a failed action does not pay a duplicate timeout.

### Ring and reader

The IRR ring uses IPD's published implementation with `W24_RING_CAPACITY_IRR=512`. It is process-lifetime memory only: monotonic `sequence`, oldest-first eviction, bounded `stats` (`capacity`, `size`, `evictedCount`, `resetCount`, `nextSequence`), the shared 12-field event schema and IPD's 1 KiB validator (oversize events are dropped, never trimmed). Nothing is persisted or sent to an external sink.

`GET /api/dhan/trace?actionId=&limit=&sinceSequence=` is loopback-only, requires the server-held transport bearer with SHA-256 constant-time comparison, accepts only bounded integer query values, and returns IRR events/stats plus the matching IPD slice and a pure correlation view. There is no unauthenticated fallback and no browser route. The body contains no credential, bearer, URL, path, vault-scheme reference, raw vendor DTO or Dhan trace header.

### Disclosure and compatibility

W-24 evidence is server-side only. `DhanQuoteView` and `BrowserQuoteEntry` project the four legacy provenance fields; tests assert the serialized watchlist view contains neither the action id nor `trace`/`traceId`/`correlationId`. The browser-bundle guard rejects every W-24 module symbol and both header names in emitted output. Existing W-19 D02 freshness and W-22/Dhan behaviour are unchanged: full suite, joined identity/UI tests and transport tests pass on the new pin.

## 5. Test evidence

`server/market-data/dhanTrace.test.ts`: **13/13 passed**. The synthetic daemon uses IPD's own ring, header validator and transport client; it serves quote, freshness and ring routes over loopback and stamps D01 envelopes with `traceId`/`correlationId`.

| Case | Proved |
|---|---|
| Contract constants | Version 1, both header names, 512 IRR / 1,024 IPD capacity, 1 KiB ceiling. |
| Generator and validation | Lowercase UUIDv4 minting; malformed contexts and unknown codes fail closed into the approved 13-category enum. |
| Ring retention | 515 records retain 512, `evictedCount=3`, first retained sequence 3, last 514, monotonic sequence. |
| Identifier correlation | Current, cache-hit and coalesced D01 identity rules; mismatched `traceId` sets `identifierConsistent=false`. |
| Joined successful quote | `IRR ACTION_START` → same `actionId` on quote/freshness headers → IPD `REQUEST_ADMITTED`/`ATTEMPT_END` → D01 `provenance.traceId`; one shared IPD `workId`, one attempt id, no ring-read gap. |
| Joined cache hit | Current `traceId` with original producer `correlationId`, consistent identifiers. |
| Joined coalesced work | Two distinct IRR actions reach IPD, each keeps its own `traceId`, both share one producer `correlationId` and one IPD `workId`; IPD records `WORK_START` then `WORK_JOIN`; both IRR actions have their own `ACTION_START`. |
| Joined failure | IPD `RATE_LIMITED` category appears on the correlation view and IRR `ACTION_END=FAILURE`; no D01 provenance is invented. |
| Pre-IPD failure | Unconfigured transport remains traceable in IRR's ring with no invented IPD event. |
| Browser disclosure | Serialized watchlist view contains no action id or trace identifiers. |
| Operator reader | Missing/wrong bearer → 401; non-loopback → 403; malformed query → 400; authenticated read returns both rings and one action id, with no token/path disclosure. |

Focused runs on the final branch head: five market-data files **151 passed**; `dhanTrace.test.ts` + `watchlists-quotes.test.ts` **29 passed**. Full Vitest suite: **3,651 passed / 1 skipped** (248 files passed / 1 skipped).

## 6. Verification gates

All executed on the final branch head before publication:

| Gate | Result |
|---|---|
| `node .ci/verify-ipd-pins.mjs` | PASS — primary `0071980f…`, siblings unchanged |
| `npm run build:broker-import` | PASS |
| `npm run typecheck:replay-server` | PASS — W-24 modules in strict closure |
| `npm run typecheck:portfolio-capture` | PASS |
| `npm run build` | PASS — production build followed by browser-bundle security gate (4 files scanned) |
| `npm run test:browser-bundle` | PASS — 3/3 |
| `npx vitest run` | PASS — 3,651 passed / 1 skipped |
| `git diff --check` | PASS |

## 7. Files changed

Implementation and guards: `frontend/server/market-data/dhanTrace.ts` (new), `dhanTrace.test.ts` (new), `dhanMarketDataTransport.ts`, `quoteConsumptionBoundary.ts`, `dhanMarketDataRoutes.ts`, `executive-transport.ts`, `watchlists-quotes.ts`, `dhanSyntheticFixtures.ts`, `tsconfig.replay-server.json`, `scripts/verify-browser-bundle.mjs`.

Pin re-baseline and regression fixtures: `frontend/package.json`, `frontend/package-lock.json`, `.ci/verify-ipd-pins.mjs`, `docs/OPERATOR_RUNBOOK.md`, `frontend/server/broker-import/brokerImportPackageConsumer.test.ts`, `frontend/server/reports/reports-persistence-integration.test.ts`, `frontend/server/user-portfolio/userPortfolioDirectP1Integration.test.ts`, `frontend/server/market-data/dhanHealthTransport.test.ts`, `dhanVerifyConnection.test.ts`, `dhanStartupPreflight.test.ts`, `dhanIdentityJoined.test.tsx`, `quoteConsumptionBoundary.test.ts`.

Publication records: this document and the authoritative roadmap.

## 8. W-24 completion and M4 assessment

**Acceptance criteria**

| Criterion | Result |
|---|---|
| One consistent identifier across IRR application action, IPD ring and D01 quote provenance | **SATISFIED at E2** — joined tests prove the same action id on IRR events, IPD header validation/ring events and D01 `provenance.traceId`; cache/coalesced cases preserve the original producer in `correlationId`. |
| Bounded rings (IRR 512 / IPD 1,024), oldest eviction, 1 KiB ceiling | **SATISFIED** — IPD's published ring is used by both sides; IRR retention test and IPD's 30-test suite cover the contract. |
| Failed-operation traceability | **SATISFIED at E2** — IRR `ACTION_END=FAILURE` with closed category for transport, provider and pre-IPD failures; IPD attempts carry `ATTEMPT_END` with category; hung transport is explicit rather than double-timed. |
| D-7 disclosure / reader safeguards | **SATISFIED** — server-only module and reader, loopback + bearer checks, bounded queries, no secret/path/vendor DTO, browser projection and build guard. |

**Overall W-24:** implementation and synthetic verification are COMPLETE on both sides. IPD implementation status is COMPLETE/VERIFIED (IPD synthetic) at `0071980f…`; IRR implementation status is COMPLETE/VERIFIED (joined E2) on this branch. Publication status is recorded in §1 and updated after merge. This is not an operational M4 acceptance.

**Actual M4 contribution:** W-24 closes the M4 trace criterion under the owner-approved local-handoff interpretation. It proves that an IRR screen action is associated with IPD's local Dhan egress attempt and the D01 provenance shown by IRR; it does **not** prove Dhan received or processed the request, and it does not satisfy M4's other conjuncts.

**Remaining independent M4 acceptance requirements:** live M2 (qualified quote) and M3 (qualified history) under E4; W-36 E3 five-service Windows start → verify → stop → restart transcript and second-launch refusal; W-38 owner daemon dry-run; W-11 four-capability connected-daemon dry-run; W-21 history screen affordances; live D02 observation replacing `NO_OBSERVATION`; and the owner's final M4 gate. W-05, W-19, W-22 and W-26 are code-complete upstream; their inclusion does not replace the live/operational evidence. W-34 remains a downstream consumer of the new trace id and is not claimed here.

## 9. Next roadmap step

Publication is complete (§10). The next step is the W-36 E3 launcher transcript and the W-38 owner dry-run (with W-37 runbook closure following), then the M2/M3 live qualification gates. W-24 does not unblock E4 by itself.

## 10. Publication record

W-24 implementation was published on branch `arena/8f80ee85-iips-review-recovered` as commit `bb2bdae956fbf0fff434fda83e80d0839c42b3dd` and PR [#656](https://github.com/ramkivs/iips-review-recovered/pull/656) to IRR `main`. Both required checks passed on the PR head: `Typecheck · Test · Build` (run `45790180561`, 4m04s) and `Windows runner · SQLite lifecycle · local IPC · child-process restart` (run `45790180361`, 3m42s). The full diff (24 files, 1,421 insertions / 55 deletions) was reviewed; `git diff --check` passed and no new secret, vault-scheme or location disclosure was introduced.

PR #656 was merged with `gh pr merge 656 --merge` at `2026-11-26T09:19:17Z` as merge commit **`f4b08f9924a145250cc32b549609ab92bd80f9d7`**. Independent post-merge verification through the GitHub API confirmed `frontend/server/market-data/dhanTrace.ts` and this evidence file are present on `main`, and that `frontend/package.json` on `main` pins `iips-production-market-data@0071980f8d35406ea6388edd413bde597fd65dde` with sibling pins unchanged. Post-merge CI runs `45790876046` (CI) and `45790875971` (Windows compatibility) both completed with `success` on that exact merge SHA. A follow-up publication-record PR records these facts in the authoritative roadmap; the merge establishes publication only, not operational acceptance.
