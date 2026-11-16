# W-11 capability gaps — IPD-owned resolution handoff (2026-11-16)

**Status: W-11 remains PARTIAL.** This handoff records the substantive capability gaps
behind the W-11 exit criterion (*following the documentation verbatim yields a connected
daemon for all four capabilities: Status, Quotes, History, Freshness*), their technical
root causes in the approved IPD baseline `901e4791e271cafdb777d56f9f66f6867b3f60c6`, and the
existing roadmap items that own each fix. It authorizes nothing by itself: every item below
is executed in IPD, in its own bounded task, under the roadmap sequence. No IPD file was
modified by this handoff. No vendor request, credential operation or Windows change was
performed. W-07 is not started by this document.

## Verified current state (source-inspected, this date)

- IRR PR #565 is OPEN/draft at `7a144b066f2c8ae7cffb0814bb3396ba7a97d212`; IRR-side W-11
  scope (configuration documentation, runbook, browser-output leak gate) is implemented
  with targeted synthetic evidence (102 targeted IRR tests passing on 2026-11-16 across
  configuration, health transport, freshness and quote/history routes; E1/E2 only).
- IPD approved baseline `901e479…`: `ServiceHealth.liveProviderConnectivity` and
  `.providerQualification` are hard-coded literals (`NOT_CHECKED_PRE_ACCESS`,
  `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`) in `DhanMarketDataService.health()`;
  `MarketDataTransportClient.health()` rejects any other values as `MALFORMED_RESPONSE`.
  The daemon defaults to `DisabledWindowsHostVaultBackend`
  (`liveResolutionSupported: false`), has no backend selector, and therefore composes
  `PreAccessNoNetworkTransport` (`vendorEgress=DISABLED_PRE_ACCESS`).
- The diverged candidate line (`bcfa6cb…`, 43 ahead / 35 behind the approved baseline)
  contains W-01/W-02/W-03/W-04 implementations, the D-7 state-model module
  (`dhan_provider_state.ts`, a pure classifier) and W-06 owner attestation material. Even
  on the candidate, `ServiceHealth` remains hard-coded pre-access and D02 freshness
  remains unwired. Candidate convergence onto an approved baseline is an IPD owner
  decision; it is not assumed anywhere below.

## Gap 1 — Status cannot report observed provider state

**Root cause.** The composed service discards observed evidence. `DhanMarketDataSource`
already tracks `lastSuccessAt`, `lastFailure`, `lastLatencyMs` in process memory, but
`health()` maps that to nothing more than `service: UP|DOWN` plus a configuration enum,
and the two live fields are compile-time literals (blocker B-5). There is no recorder, no
`AUTHENTICATED`/`OPERATIONAL` path, and the transport client would reject such values.

**Owner:** IPD — **W-07** (live-capable `ServiceHealth`, additive/versioned, incl. the
transport-client and IRR mirror types in the same change set), then **W-08** (bounded
observed-state recorder; Status reads it and never triggers a call; only the explicit
D-7 verify action may probe once), then **W-09** (`/v1/diagnostics`). **W-10** (IRR)
follows and removes IRR's own `IIPS_DHAN_*` readiness derivation and the published
`secretRefPointers` (B-6/B-15). Prerequisite: D-7 (the candidate line already carries a
D-7 decision record and conformance tests; IPD to confirm its accepted status).

**Without vendor traffic (E1/E2):** the full contract widening, recorder transitions
(success, `AUTHENTICATION_FAILURE`, `CREDENTIALS_EXPIRED`, timeout), proof that a health
read performs zero transport invocations and mutates nothing, and IRR rendering from
injected payloads. **Requires E4:** any state at or above `AUTHENTICATED`, and
`liveQualified` — these require a real vendor interaction recorded by W-08 (M1/W-06
class evidence), never a local inference.

## Gap 2 — D02 freshness is structurally empty

**Root cause.** The capability exists but is not connected (blocker B-8).
`DhanHistoricalCache` and `dhanHistoricalCacheKey` are implemented and unit-tested in
`dhan_operational_controls.ts`, and the read-only projection `freshnessStatus()` plus the
P07 evaluator already handle D02 (threshold 86 400 s). But
`DhanMarketDataService.getHistorical()` calls `DhanHistoricalAdapter.fetchDailyCandles()`
directly (rate limiter only — no cache, no coalescer, no observation record), and
`getFreshness({domain:'D02_OHLCV'})` returns a hard-coded `null` lookup, yielding
`NOT_AVAILABLE`/`UNKNOWN` for every request, forever. `DhanHistoricalCacheEntry`
(`{result, cachedAt}`) also does not yet match the `CacheLookup` provenance shape the
freshness projection consumes, so an observation adapter must be defined.

**Owner:** IPD — **W-19** (route `getHistorical` through `DhanHistoricalCache` on the
complete request identity; record per-request refresh/observation state; D01 unchanged).
Roadmap prerequisite: W-17. Per roadmap §12 the wiring and its synthetic verification
need no credentials and may be built ahead; the `asOf` rule must be stated explicitly —
the defensible rule under the existing model is *observation receipt time* (when IPD
received/normalized the series), never the newest candle timestamp silently relabelled.
Formal W-19 acceptance against observed payloads follows W-17. No new decision is a
prerequisite for the wiring; D-4 governs consumer precedence (W-20), not this item, and
must not be used to bypass historical-source authority.

**Tests required (per W-19 verification):** a served request populates the cache; a
repeat request hits it; freshness then reports a real `cacheState`/`asOf`/verdict; an
empty result is cached and still distinguished from failure; D01 behaviour unchanged.

## Gap 3 — Quotes: wired end-to-end, live-blocked at the egress gate

**Root cause.** No interface is missing. IPD daemon exposes `POST /v1/quotes`;
`getQuote` validates the exact D114 identity fail-closed, then runs the refresh
orchestrator (cache, limiter, coalescer) into `DhanApiClient`. IRR's
`/api/dhan/quotes` route and transport client are implemented and synthetically tested.
The live path stops at daemon composition: with the disabled default backend,
`PreAccessNoNetworkTransport` replaces the HTTPS transport, so a real quote fails
closed pre-access. Absent-depth normalization to `bid = ask = 0` (B-10) additionally
blocks qualification honesty until W-13.

**Owners:** IPD — **W-12** (live wire qualification, E4), **W-13** (honest bid/ask,
IPD + IRR rendering; buildable from D-5 without live evidence), **W-14** (live mapping
qualification, E4; the only item that establishes mapping correctness). IRR — **W-15**
(screen) after W-11/W-13; **W-29** is the later shared consumption boundary, not a W-11
closer. Live execution requires the Phase 1 chain (W-01…W-04, W-06/M1) on an approved
baseline — present on the candidate line, absent from `901e479…`.

**Synthetic today (E2):** daemon + injected provider transport (`SYNTHETIC_INJECTED`)
exercising all quote success/failure modes; IRR route fixtures (already green).
**Requires E4:** everything in W-12/W-14 and any claim of a connected live quote.

## Gap 4 — History: wired end-to-end, unqualified and freshness-blind

**Root cause.** `POST /v1/historical` → `getHistorical` → `DhanHistoricalAdapter`
exists, with provisional (docs-only, unqualified) interval vocabulary
(`1m/5m/15m/1h/1D`), a fixed 1 825-day per-request guard with no chunking, and
`coverageClaim: ACCESS_PENDING_UNVERIFIED` on every result. The same egress gate as
Quotes blocks live calls; the missing cache wiring (Gap 2) makes its freshness
unobservable; epoch-unit and IST/UTC-midnight semantics are assumed, not observed.

**Owners:** IPD — **W-17** (live wire qualification per interval, E4), **W-18**
(limit/chunking reconciliation, after W-17), **W-19** (freshness, Gap 2). IRR — **W-21**
(screen) after W-11/W-18; **W-20** (D02/D114-PIT precedence) only as D-4 decides;
**W-39** is consumer adoption, not a W-11 closer.

**Synthetic today (E2):** adapter normalization fixtures, fail-closed batch rules,
IRR history-route fixtures. **Requires E4:** interval semantics, boundaries, limits
(W-17/W-18) and any coverage statement.

## What closes W-11, and what only feeds M4

W-11's own exit criterion is a *connected-daemon* dry-run of all four capabilities
following the documentation. Closing it therefore needs, in roadmap order: the IRR scope
(done), W-07 → W-08 → W-09 → W-10 for truthful Status, W-19 for non-empty Freshness,
and an authorized version-correlated connected-daemon Quotes/History demonstration on
an approved live-capable baseline. **M4 remains strictly larger** (G-M4 = G-M2 ∧ G-M3 ∧
L5 ∧ L6): qualified live quotes and history (W-12/W-14, W-17/W-18), W-22 session-aware
freshness, W-24 traceability, and the Windows start/health/stop/restart E3 transcript.
Nothing in this handoff advances W-07 or any later item.

## Next executable roadmap activity

**IPD-owned W-07** (prerequisite D-7 confirmed accepted in IPD), executed in IPD as a
single bounded pass — contract widening, contract-drift and round-trip tests, full IPD
suite per the §9.3 gate after W-07 — followed by W-08, W-09, then IRR W-10. In parallel
at IPD's discretion per roadmap §12: the W-19 wiring with synthetic tests (formal
acceptance after W-17). No Windows evidence run is requested by this handoff: further
local health observations cannot change the W-11 decision, because every remaining gap
above is a source-level capability gap, not an observation gap.
