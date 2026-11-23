# W-14 — Independent Investigation and Dependency Assessment

> **Post-PR-#627 / PR-#629 Recovery Note:** Recovered verbatim from PR #626 (`6f3e9a2c`). Subsequent to this snapshot, IRR PR #627 (`8f893112`) advanced the pinned IPD dependency from `1ce6a829…` to PR #176 (`2685562522f1a2fd1d745a7857f771bf21453315`) and merged `D-4` acceptance, and PR #629 (`4059e045`, `D4-DR-02`) clarified that all `4,680` W-27/P7 rows are statically qualified (`proposedAdditions: 0`, `alreadyQualified: 4680`) while remaining `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` until `W-14` `E4` + `W-27` parity complete. See master tracker `§16.326`.

**Date:** 2026-11-23  
**Branch:** `arena/f18beaf5-iips-review-recovered` @ `b52b6e5` (base `b7927de`)  
**Type:** Investigation only. No IPD source modified, no live Dhan request made, no credential accessed, no Windows host touched.  
**Primary references verified in this repo checkout:**  
- Roadmap v1.1: `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` (ID `DHAN-LIVE-ROADMAP-2026-11-11`, rev 2026-11-11)  
- Baseline investigation: `docs/integration/DHAN-LIVE-MARKET-DATA-CURRENT-STATE-INVESTIGATION-2026-11-11.md` (IRR `9e957ad`, IPD `a624d06`, pin `1aee57f`)  
- W-06 assessment: `docs/integration/DHAN-W06-ROADMAP-PROGRESSION-ASSESSMENT-2026-11-15.md`  
- Quote-API root cause: `docs/integration/DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`  
- D-7 acceptance: `docs/integration/DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`  
- W-11 execution: `docs/integration/DHAN-W11-IRR-EXECUTION-2026-11-15.md`  
- W-28 blocker/measurement: `docs/integration/DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md` / `DHAN-W28-MEASUREMENT-2026-11-23.md`  

---

## 1. Current W-14 status — what is actually complete and what remains

**Status: OPEN — not started as live qualification. One operator-reported sample is not W-14.**

| Field | Authoritative definition (roadmap v1.1 §6 W-14) | Actual state in this checkout |
|---|---|---|
| Objective | Prove mapping rows correct **against the vendor** — 96 existing rows (48 companies × NSE+BSE) sampled across NSE/BSE, plus every W-27 row that matters to owner — by confirming vendor returns expected instrument for `(exchangeSegment, dhanSecurityId)` and recording per-instrument evidence; identify failure signature of stale `dhanSecurityId` | **Not done.** No per-instrument E4 record exists in either repo. The only live sample is operator-reported Reliance `EQ_RELIANCE_IN / ISIN:INE002A01018:EQ / NSE_EQ` → `POST /v2/marketfeed/quote {\"NSE_EQ\":[\"2885\"]}` → HTTP 400 `HTTP_ERROR` (IPD PR #156/W-06 record), then independently reproduced as Python `{\"NSE_EQ\":[2885]}` → HTTP 200 (this investigation's §2). That sample is useful but does not satisfy the NSE/BSE sample breadth, the wrong-id probe, or the per-row evidence. |
| Verification | Targeted + **E4**: sample confirms against vendor; deliberately wrong `dhanSecurityId` → `UNRESOLVED_INSTRUMENT` or obvious mismatch, never silent wrong data | **None.** No E4 harness, no wrong-id probe, no mismatch-signature doc. |
| Exit criteria | Mapping correctness evidenced for sample; mismatch signature documented; newly added rows either qualified or explicitly withheld | **Not met.** Dhan payload shape still `PROVISIONAL`; normalization not adjusted to observation. |
| Enables | M2 declaration, W-27 promotion of new rows, W-30/W-33 | Blocked until W-14 passes. |

**Tracker consistency check:** W-14 appears nowhere in IRR PR history as merged implementation; it is absent from `IIPS_V3_E2E_MASTER_TRACKER…` and from IPD `main` branch history. The only W-14-adjacent implementation is W-27 construction (see §4). The roadmap's Appendix A table lists W-14 prerequisites as `W-06 (W-12 recommended); W-27 for new rows` — that is the governing statement; the earlier roadmap body line `Prerequisites: W-06 (W-12 recommended first)` is consistent (W-27 only for added rows).

**Contradiction to report without resolving:** Roadmap header (p1) declares **W-06 COMPLETE — OWNER ATTESTED at IPD `617fab0`**, superseding the 2026-11-15 assessment's **W-06 PARTIALLY COMPLETE** (pending full-output scan attestation). Both statements coexist in this repo. For W-14 dependency reasoning the roadmap header is the governing progression signal, but the assessment's documentary gap (zero secret/location strings in captured startup/quote) has not been independently observed in this checkout (see §3.1). This is tracked as contradictory, not silently resolved.

---

## 2. Scope and acceptance criteria — authoritative requirements

Extracted verbatim from roadmap v1.1 §6 (normative):

> **Prerequisites:** W-06 (W-12 recommended first); W-27 for rows added later  
> **Scope:** For each instrument in the qualification sample — the 96 existing rows, sampled across NSE and BSE, plus every row added by W-27 that matters to the owner — confirm the vendor returns the expected instrument for that `(exchangeSegment, dhanSecurityId)`, and record per-instrument evidence. Identify the failure signature of a stale `dhanSecurityId` so it can be recognised later. **This is the only item that establishes live mapping correctness**; W-27 establishes construction correctness, W-28 establishes measured coverage, and neither substitutes for this  
> **Verification:** Targeted + **E4**: sample confirms against the vendor; a deliberately wrong `dhanSecurityId` produces `UNRESOLVED_INSTRUMENT` or an obvious mismatch rather than silent wrong data  
> **Exit:** Mapping correctness evidenced for sample; mismatch signature documented; newly added rows either qualified or explicitly withheld  
> **Enables:** M2 declaration, W-27 promotion of new rows, W-30/W-33  

**Scope clarifications present in roadmap but not in W-14 table:**

- **Exact canonical identity** is the only binding (W-27 normative paragraph, §6): `ISIN + exchange series bound to companyId` through governed P7 path; symbol-name/token matching is never authoritative, and the 68-row fixture comparison (B-04/B-06) is explicitly *planning signal only* (`docs/integration/B04-DHAN-68-ISIN-NSE-REASSESSMENT-2026-11-06.md` 1/67, `B06-…` 1/67 unchanged).
- **Sample breadth is not enumerated as a count** — roadmap says *sampled across NSE and BSE* plus every W-27 row that matters. The baseline 96 rows are `NSE:EQ 48`, `BSE:A 47`, `BSE:B 1` (investigation §E). A defensible W-14 sample must cover both exchange/segment types and both `EQ` and `B` BSE series; exact sample size is an implementation-plan decision, not a roadmap constant.
- **M2 exit criteria (§10.3)** additionally require for the same sample: values/timestamps/identity cross-checked independently, normalization verified against observed payload, `bid`/`ask` absence per D-5, and `UNRESOLVED`/`MALFORMED` still fail-closed. W-14 alone does not close M2, but W-14 plus W-12/W-13 does.

**What W-14 is not:**
- Not W-27 pipeline construction or byte-reproducibility (E1/E2, no live call).
- Not W-28 coverage measurement against owner's holdings (IRR `frontend/server/w28/coverageMeasurement.ts`, synthetic 21/21, §3.4).
- Not W-12 payload qualification (vendor field-shape vs normalizer) — recommended first for edit-sequencing (`dhan_normalizer.ts` shared), but distinct acceptance.

---

## 3. Dependency assessment — each dependency, what it establishes, whether anything remains

W-14 prerequisites per Appendix A: **W-06 (W-12 recommended); W-27 for new rows.** Shared foundation (D-7, W-07…W-11, W-13, W-22, W-24, Phase 1) is implement-once — Track 2 reuses it unchanged.

### 3.1 W-06 — Provision real credentials and prove first live authentication (M1)

**What it establishes for W-14:** That a real Dhan credential can be resolved from the Windows store, that vendor egress opens (`IPD_SERVER_HTTPS`, not `DISABLED_PRE_ACCESS`), and that one authenticated vendor interaction completes. Without this, no E4 mapping probe can be issued.

**Implementation history (IPD):**
- D-1…D-2 decisions, W-01 `VaultProvider` member, W-02 DPAPI backend, W-03 daemon selector, W-04 provisioning utility were built on IPD candidate branch `arena/…` (`bcfa6cb…`, 43 ahead / 35 behind `901e4791e271cafdb777d56f9f66f6867b3f60c6` approved baseline; see `DHAN-W11-CAPABILITY-GAPS-IPD-HANDOFF-2026-11-16.md`).
- W-06 operator execution reported on Windows checkout `af4460ee…` (rebuilt, user-scope DACL, daemon start with `vendorEgress=IPD_SERVER_HTTPS`, `qualifiedMappings=96`) and one Reliance quote → HTTP 200 `ok:true` D01 SNAPSHOT (`ltp 1339.7`, `providerObservation 2026-11-13T10:29:51Z`, receipt `2026-11-15T13:35:10Z` — §2 of W-06 assessment). That is the substantive M1/M2a observation.

**Current status:** Roadmap header treats W-06 as **COMPLETE — OWNER ATTESTED at `617fab0`** (`https://github.com/ramkivs/iips-production-market-data/blob/617fab0…/docs/integration/DHAN-W06-FINAL-OWNER-ATTESTATION.md`), superseding the assessment's `PARTIALLY COMPLETE` (pending sanitized grep of startup/quote for both secret values, transport token, `vault://`, carrier paths — zero occurrences). The attestation is IPD-owned, on a candidate line, not on IRR `main` (this session verified `617fab0` fetch 404 from IRR remote — IPD publication gap, §2 of D-7 acceptance notes same pattern for `bcfa6cb…`).

**Outstanding for W-14:** At governance level, W-06 is unblocked (roadmap progression). At evidence level, the pending scan-attestation is the only open item and does not require a repeat quote; it requires the operator/IPD to publish the grep result over retained redacted transcript. **For W-14 purposes, this is not a technical blocker** — a successful authenticated interaction is attested — but a future W-14 E4 run must still produce its own per-row redacted evidence and pass the same zero-secret/location grep independently. No new W-06 execution is required for W-14; reusing the attested credential/backend suffices.

**Related decision:** D-1…D-2, D-6, D-7 are the Phase-0 parents. D-7 is **ACCEPTED FOR IRR** (2026-11-16, §4 of `DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`, effective on `main` at W-10 merge `752fb3e…`) — this unblocks W-07…W-10. D-1/D-2 themselves live in IPD (store choice, carrier DACL, posture — DPAPI user scope, two carriers, versioned envelope, four re-read triggers). D-6 (token issuance procedure) is operator-owned and already exercised for W-06. No D-blocker remains for W-14.

### 3.2 W-12 — Quote wire qualification (live, IPD) — recommended first

**What it establishes for W-14:** That the vendor's `POST /v2/marketfeed/quote` request/response can be parsed and normalized into a valid canonical D01 envelope, and that observed field deviations are carried into DTO/normalizer/regression fixtures. Without this, a W-14 mapping probe may be misread (e.g., stale `ohlc.close` vs `net_change`-derived `previousClose`, missing `last_trade_time`).

**Actual discovery (this checkout):** The successful Python number-typed probe vs IPD's string-typed body is not merely a serialization difference — it is the **root cause of the current 400 failure** (`docs/integration/DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` §§3–5,8):
- Working: `{\"NSE_EQ\":[2885]}` (JSON number) → HTTP 200
- IPD `buildQuoteRequestBody`: `{\"NSE_EQ\":[\"2885\"]}` (JSON string) → HTTP 400 `DH-905/813` class → `HTTP_ERROR`, surfaced as IRR HTTP 502, with vendor error body discarded (§7 — no `vendorErrorCode` preserved)
- Fix owned by IPD: emit numbers, add body-type conformance test; no IRR change.

**Status:** **OPEN, blocking W-14's quote path.** W-12 is not prerequisite in the strict dependency graph, but it is a **technical execution blocker**: until the string→number fix lands, every W-14 quote probe will fail with `HTTP_ERROR` regardless of mapping correctness. Edit-sequencing note: W-12 and W-13 both touch `dhan_normalizer.ts` / `dhan_market_data_service.ts`; roadmap prescribes W-12 first.

**Outstanding:** IPD PR correcting `buildQuoteRequestBody` (and historical builder if shares pattern), redacted request/response capture comparison against `dhan_dto.ts` / `dhan_normalizer.ts`, updated DTO parsing, regression fixture, independent value cross-check vs secondary source, E4 confirmation. The retained W-06 Reliance canonical response is usable starting material but does not by itself satisfy W-12's field-shape verification (see W-06 assessment M2-not-achieved).

### 3.3 W-27 — Repeatable mapping expansion pipeline (construction; no live)

**What it establishes for W-14:** A governed, re-runnable IPD pipeline (P04 `SecurityMaster` + public Dhan scrip-master CSVs, SHA-verified) that emits `qualification-manifest.json` with per-row dispositions and coverage counts, runtime local-file-only. Newly produced rows are `PROPOSED` until W-14 qualifies them.

**Actual state:**
- Original P7: 96 qualified rows / 48 companies (`NSE:EQ 48, BSE:A 47, BSE:B 1`, bounded by P04 23,644 no-correspondence, investigation §E, `evidence/dhan-p7/` in IPD).
- Expansion artifact observed in this repo as consumed IPD pin **not** the pipeline source but the manifest: IPD PR #164 MERGED `bcb45d7…` (2026-11-15), manifest `371bf3bd4bb3eba49bbf6ae614d3edaaa04793ed` (parent pipeline `325266d…`), SHA `69a918f78791114e8fb036ddfd2a2005facdddf785a7496bc28f541fd4964769`, **4,680 qualified** (`NSE:EQ 2390, BSE:A 700, BSE:B 1590`, counts `non_equity 193340, invalid 24, no_p04 19060` — `evidence/w28-coverage-summary.json` / `DHAN-W28-…`). Verifier `scripts/w28_verify_manifest.py` checks digest/pipeline/counts/registry shape; **parity gap remains** (no independent byte-identical rerun, `DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md` §5).
- IRR-side W-27 is not implemented; IRR consumes the manifest via `frontend/server/w28/registrySnapshot.ts` (W-28) and `w28:measure` CLI — correct separation.

**Status:** Pipeline exists and has produced a manifest; acceptance per roadmap (byte-reproducible, provenance per row, near-miss rejection, daemon `qualified-only` load, proposed withholding) is **not yet recorded** in IRR evidence. For W-14, the 96-row sample is immediately available; the 4,680-row expansion is available as candidate *new rows that matter* but their promotion is explicitly gated on W-14 (new rows stay proposed). W-14 for existing rows **does not wait** for W-27 perfection.

**Outstanding:** Byte-reproducibility proof, near-miss test record, and promotion policy for new rows (not a W-14 blocker for the 96).

### 3.4 W-13 — Honest unavailable bid/ask (D-5) and W-11 — Config reconciliation

**W-13 (D-5):** Decide canonical representation of unavailable depth (roadmap §5, options optional-fields or `depthAvailable`), then implement in `MarketQuotePayload`/`validateMarketQuotePayload`/`dhan_normalizer.ts`/`EngineApiAdapter` + IRR `DhanQuotes.tsx`. Status **OPEN**; current `topOfBook()` → `0` which passes validation and is indistinguishable from real zero (B-10). **Not prerequisite for W-14** except sequencing (W-12 first); a W-14 probe using quotes with absent depth must not record `bid=0/ask=0` as evidence — it should record `unavailable` after W-13. W-14 itself does not need depth to assess mapping, but M2 does.

**W-11 (IRR+IPD docs):** Documented transport config + browser leak gate. IRR side **PARTIAL → re-verified 2026-11-17 as still PARTIAL** (`DHAN-W11-IRR-EXECUTION-2026-11-15.md` + 17-Nov section; 3037 tests, browser gate, port 8791 correction, `.env.example` fixed, `OPERATOR_RUNBOOK.md` §3.3a). Four-capability connected-daemon dry-run (Status/Quotes/History/Freshness) is **outstanding** (`DHAN-W11-IPD-CONFIGURATION-HANDOFF-2026-11-15.md` gaps). **Not prerequisite for W-14** but shares configuration surface (base URL `IIPS_MARKET_DATA_BASE_URL`/`TRANSPORT_URL`, token) that W-14's live runs will reuse. The IPD pin consumed by IRR (`1ce6a829a7ce65550356a0071c108a60f2d813be` — W-07/W-08/W-09/W-10, pin from `d80d773…`) is *not* the W-06-attested `617fab0` — see §4 contradiction. For W-14 this means the daemon that will be probed must be from a live-capable baseline (see §7).

### 3.5 W-28 — Coverage against real holdings (IRR+IPD)

**Relation to W-14:** Roadmap is explicit — **W-14 is live correctness, W-27 is construction correctness, W-28 is measured coverage**. W-28 depends on W-27, not on W-14; W-14 does not depend on W-28. IRR's W-28 infrastructure is complete (measurement core `frontend/server/w28/coverageMeasurement.ts`, loader `frontend/server/w28/registrySnapshot.ts`, CLI `frontend/server/w28/measureCoverageCli.ts`, 21/21 synthetic tests, `DHAN-W28-MEASUREMENT-2026-11-23.md`), but final coverage number is blocked on Windows owner-bound portfolio capture (`DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md`). **No dependency cycle** — W-28's existing blocker does not block W-14.

### 3.6 Milestone dependency (M2)

W-14 is on the M2 critical path: `M2a → W-12 → W-13 → W-14 → M2`. M2 exit (§10.3) additionally requires W-12-normalized payload cross-checked, `bid`/`ask` absence per D-5, and fail-closed preserved. W-14's mismatch-signature is the mapping-specific half of M2. G-M2 gate evidence is **L7/E4 exclusively** (§9) — synthetic or operational observation alone cannot close it.

---

## 4. Existing implementation and mapping evidence — actual current state and provenance

### 4.1 Instrument mapping data and provenance

| Item | Current value | Provenance (this checkout) |
|---|---|---|
| Canonical identity | `companyId` (company level) + `D114SecurityIdentity = ISIN:<isin>:<series>` (security level); registry key `companyId\|exchangeSegment\|isin\|series` (`DhanInstrumentRegistry.keyOf`) | Roadmap §B.1, investigation §E; IPD `dhan_instrument_map.ts`, `dhan_security_identity_service.ts` |
| Provider identity | `(exchangeSegment, dhanSecurityId)` with conflict detection (`SECURITY_MAPPING_CONFLICT`, `SECURITY_ID_REUSED`, `EXCHANGE_MISMATCH`, `INSTRUMENT_TYPE_MISMATCH`) | Same sources; `dhan_instrument_mapping_integration.ts` |
| Original qualified set (P7) | **96 rows / 48 companies** — `NSE:EQ 48, BSE:A 47, BSE:B 1`, `instrumentType EQUITY` only, 23,644 no-P04 rejections, 193,340 non-equity, 24 invalid | Baseline investigation §E; IPD `evidence/dhan-p7/qualification-manifest.json` (pin `1aee57f…` era), daemon startup `qualifiedMappings=96` (observation A-1) |
| Expanded set (post-W-27) | **4,680 qualified** (`NSE:EQ 2390, BSE:A 700, BSE:B 1,590`), same non-equity/invalid/no-P04 counts, manifest `371bf3bd…` / pipeline `325266d…` / SHA `69a918f…` | Consumed as W-28 artifact (`evidence/w28-coverage-summary.json` counts, `DHAN-W28-MEASUREMENT-2026-11-23.md` §2); IPD PR #164 `bcb45d7…` — parity gap noted (§3.3) |
| Runtime loading | `loadGovernedP7InstrumentRegistry` reads local manifest only, never downloads; `disposition QUALIFIED` only, conflict-detected | Investigation §E, W-27 scope |
| Quotes vs History asymmetry | Quote requires `resolveExactIdentity(companyId, segment, identity)` (ISIN+series+segment); History accepts `companyId` alone via `registry.resolve(companyId)` | Investigation §E / H-5 |
| Mapping freshness | `lastVerifiedAt 2026-11-06` (static CSV retrieval), vendor id `isinAuthority NON_AUTHORITATIVE`, series vendor-sourced | Manifest `identityLimitation` |

**Files in this checkout that carry mapping-relevant code (IRR side — consumer, not authority):**
- `frontend/server/market-data/dhanIdentityTransport.ts` — identity resolve/qualify transport (`UNRESOLVED_INSTRUMENT`, `MISSING_ISIN` paths)
- `frontend/server/market-data/dhanHealthState.ts` / `dhanHealthTransport.ts` — Status derivation (cannot reach `AUTHENTICATED`/`OPERATIONAL` without W-07, §3.4)
- `frontend/server/w28/coverageMeasurement.ts` — exact-identity matcher used by W-28 (no name/symbol fallback, same discipline W-14 requires)

**What IRR does not have:** The P7 or expanded manifest file itself (`find -name qualification-manifest` returned 0 in IRR — expected, as manifest is consumed via IPD pin `iips-production-market-data#1ce6a829…` / `dhan-server` stub `0.0.0-stub` in `frontend/node_modules/iips-production-market-data/dhan-server/index.js`). Mapping authority is IPD alone.

### 4.2 Existing vs subsequent rows

- **Existing 96:** The only set with W-06-attested live sample (Reliance `2885` on `NSE_EQ`). All other 95 are *construction-correct* but *live-unproven* — this is precisely the W-14 gap.
- **Subsequent ~4,584:** `4680 − 96 = 4584` new qualified rows introduced by W-27. Per roadmap, they are **proposed until W-14 accepts them**; daemon already ignores `PROPOSED` rows by loading qualified-only. No per-row live evidence yet; W-14 for new rows that *matter to owner* is a scoped subset (not necessarily all 4,584). Owner relevance is use-case defined (portfolio holdings sample + W-28 gap list) — see §7.3.

### 4.3 Exact instrument identity and exchange-segment handling

- Segments are literal `NSE_EQ` / `BSE_EQ` only (`dhanMarketDataRoutes.ts:286`, `frontend/server/market-data/quoteConsumptionBoundary.ts` `EXCHANGE_SEGMENTS.has(segment)` — IRR `3037 passed, 1 skipped` on current `main`).
- SecurityId grammar is `ISIN:<12-char ISIN>:<series>` (BSE series `A`/`B`, NSE `EQ`); mapping key includes all four parts — a stale series or exchange mismatch must fail closed, not silently return wrong instrument. Investigation observations A-4/A-5 confirm `UNMAPPED_COMPANY_ID` on wrong series/segment, but that is synthetic-failure behaviour, not live vendor mismatch signature.

---

## 5. Vendor qualification evidence — what has and has not been demonstrated

### 5.1 Live vendor evidence in this repo (E4)

| Evidence | Class | Result |
|---|---|---|
| IPD-reported Reliance quote via `Disabled`→`enabled` path on `af4460ee…` → `617fab0…`: `POST /v2/marketfeed/quote {\"NSE_EQ\":[\"2885\"]}` → 400 `HTTP_ERROR` (IPD PR #156, W-06 conformance) | E4 (auth succeeded, request shape wrong) |
| Python independent probe `{\"NSE_EQ\":[2885]}` → 200 (same credential pair, investigation task brief) | E4 (input-type signal) |
| Dhan root-cause report (this checkout, §3–5) comparing the two bodies, concluding string vs number as sole material difference | **E0/E1 analysis**, not new E4 |
| No other Dhan vendor request/response captured in IRR `main` | — |

**IPD publication note:** W-06 final attestation at `617fab0` is referenced in roadmap p1 but not present in IRR mirror object database (clone fetch 404). It is treated as authoritative progression signal per roadmap, but not independently read back here — same limitation as D-7's `bcfa6cb…` IPD acceptance noted in `DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md` §1.

### 5.2 Non-live evidence (must not be cited as live qualification)

- **160 IPD Dhan cases passing** (investigation §F.1 — `dhan_d1_provider_foundation` … `irr_stage2_market_data_route`) — **E1, synthetic only**; vendor payload `PROVISIONAL`.
- **IRR ~263 declarations** (`dhanMarketDataRoutes.test.ts` 44, `dhanFreshnessRoutes.test.ts` 30, `dhanIdentityJoined.test.tsx` synthetic joined path through injected fake provider) — **E2 synthetic**; proves transport shape, not Dhan correctness. Current `main` post-merge CI 44037855606 SUCCESS; PR #565 W-11 draft OPEN with `Typecheck · Test · Build` instability historically, now post-W-10 merge green.
- **W-28 measurement** 21/21 synthetic tests (exact identity, proposed≠qualified, evidence-limited) — **E1**, no owner holdings, no vendor.

### 5.3 Mapping mismatch / stale identifier / unresolved behaviour today

- **Unresolved:** `UNRESOLVED_INSTRUMENT` / `UNMAPPED_COMPANY_ID` for unknown `companyId`, wrong series, wrong segment — **verified synthetically** (obs A-4/A-5).
- **Stale `dhanSecurityId`:** **Unknown signature.** The Reliance case proves a *type* mismatch (string vs number) is `HTTP_ERROR`/`DH-905`, but a *stale id* (once-valid, now corporate-action/relistered) has no recorded E4 signature. Roadmap W-14 asks for exactly this documentation; it is an open deliverable (see §9 — wrong-id probe).

---

## 6. Evidence gaps and risks — incorrect, stale, ambiguous or unqualified mappings

| # | Gap / risk | What is missing | Consequence if ignored |
|---|---|---|---|
| G-1 | **Every mapping is live-unproven except one Reliance observation from a prior (mis-typed) shape** — 95/96 P7 plus 4,584/4,680 expanded rows have zero per-row E4 | Per-row `(exchangeSegment, dhanSecurityId)` → vendor instrument recorded against canonical identity | M2 cannot be declared; W-27 rows cannot be promoted; W-30/W-33 valuation on stale ids would serve wrong prices silently if mapping drifts |
| G-2 | **No stale-id failure signature documented** | A deliberate wrong-id probe with redacted vendor/request/response and mapped category (`UNRESOLVED_INSTRUMENT` vs obvious mismatch vs `HTTP_ERROR`) | Future staleness (relists, series changes) indistinguishable from transient vendor error |
| G-3 | **Request serialization is wrong today** — string ids → 400 `DH-905` for every quote, irrespective of mapping | IPD fix + body-type conformance test (see §8 quote-API RCA §9) | W-14 cannot execute at all until fixed; M2a cannot be re-observed |
| G-4 | **Vendor payload shape is PROVISIONAL** — `last_trade_time` format, `net_change` presence/sign, `ohlc.close` semantics, depth/volume, historical columnar keys/epoch/adjustment | W-12's DTO vs observed payload comparison + normalization adjustment | Mapping correctness could be coincidentally correct while values are mis-normalized (e.g., `previousClose` from wrong field) |
| G-5 | **D-7 diagnostics still expose secret-adjacent paths** — `describeDhanConfig` renders `accessTokenKeyPath/clientIdKeyPath`, IRR `secretRefPointersOf` publishes pointers | W-03 removes paths per D-7 `MUST NOT`; W-09/W-10 complete | Redacted W-14 evidence could inadvertently include prohibited disclosure if published before W-03 |
| G-6 | **IPD pin divergence** — IRR consumes `1ce6a829…` (W-07…W-10, PR #168 `5b384c…` / #169 `75db511…` / #170 `a402ee…`, `POST /v1/connection/verify` per `frontend/server/market-data/dhanMarketDataTransport.ts:48` header) while W-06 attestation is at `617fab0` and candidate is `bcfa6cb…` | Convergence decision — which baseline is W-14's daemon source | W-14 run on a baseline with disabled backend or stale manifest would not be live-capable |
| G-7 | **Expansion pipeline parity gap** — 4,680 manifest verified by SHA/pipeline/counts but not independent byte-reproducibility from public CSVs + P04 `SecurityMaster` | W-27 byte-identical rerun proof, near-miss rejection | Incorrect mapping could be baked into manifest and then live-qualified against itself |
| G-8 | **Bid/ask depth absent → 0** — `topOfBook()` zero passes `validateMarketQuotePayload`, indistinguishable from real zero | W-13 per D-5 optional-fields fix | Live quote with absent depth would be recorded as `bid=0/ask=0` evidence, corrupting G-2 |
| G-9 | **Status cannot express live state** — `liveProviderConnectivity` literal, `LiveQualified` rejected as `MALFORMED_RESPONSE` | W-07 additive versioned widening, then W-08/W-09/W-10 | W-14 success would be invisible on Status; M4 provider-state element would remain blocked |

---

## 7. Governance and authority — decisions already recorded and still outstanding

| Decision | Status | Record |
|---|---|---|
| D-1 Windows store / carrier spec | Decided — IPD candidate `bcfa6cb…` (DPAPI user scope, two carriers, versioned envelope, DACL, atomicity; provider member admitted) | Roadmap §5 + W-06 attestation chain; not required *again* for W-14 |
| D-2 Read posture / bounded re-read | Decided — same candidate (session holder, 4 re-read triggers, latch, expired vs auth distinction) | Same |
| D-3 Freshness out-of-market | **Not required for W-14** (IPD decision for W-22) | Roadmap §5 |
| D-4 D02 vs D114/PIT precedence | **Not required for W-14** (IPD+IRR for historical) | Roadmap §5 |
| D-5 Bid/ask absence representation | Decided shape pending — options (a) optional fields / (b) `depthAvailable`; recommendation (a) + provenance | Roadmap §5; **outstanding decision record** — needed for W-13, recommended before W-14's value cross-check but not a blocker for mapping identity proof |
| D-6 Token issuance procedure | Operator-owned, already exercised (W-06) | Roadmap §5; no new decision needed unless rotation |
| D-7 Provider state model + diagnostics disclosure | **ACCEPTED** — IPD `bcfa6cb…` (2026-11-12), **IRR accepted** 2026-11-16 (`DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`, effective at PR #565 merge to `752fb3e…`), covering 8 states, V1/V2 verify, MAY/MUST-NOT, `secretRefPointers` superseded | Blocker B-15 still open until W-03 implements removal |
| W-06 M1/M2a owner attestation | **ATTESTED** at IPD `617fab0` (roadmap p1), superseding `PARTIALLY COMPLETE` | Governs W-14 prerequisite satisfaction |
| W-11 `503` lift / Gate A′ | **PARTIAL** (IRR leak gate done, 4-capability connected run outstanding) | `DHAN-W11-IRR-EXECUTION-2026-11-15.md`, `DHAN-W11-IPD-CONFIGURATION-HANDOFF-2026-11-15.md` — not prerequisite for W-14 |
| W-01…W-05 IPD implementation authority | **Executed on candidate**, not yet effective on `main` baseline `901e4791e271cafdb777d56f9f66f6867b3f60c6` | Handoff §1 — candidate convergence is IPD owner decision, not assumed |

**No new owner decision is required to *authorize* W-14.** The roadmap authorizes its scope. An **execution authorization with request budget and disclosure review** is required before any further live vendor traffic (see §8).

---

## 8. Execution prerequisites — what must be available and authorised before live qualification

**Mandatory before any further vendor call (fail-closed if missing):**

1. **Live-capable daemon baseline selected by IPD owner.** Either the attested `617fab0` state or a convergence of candidate `bcfa6cb…` + W-06 credential material onto an approved baseline that retains W-07…W-10 state-vocabulary changes *without* reverting to `DisabledWindowsHostVaultBackend`. The current IRR-consumed pin `1ce6a829…` is W-07…W-10-aware but the roadmap-progression W-06 attestation references `617fab0` — the operator must state the baseline; do not assume.
2. **W-12 serialization fix landed on that baseline** (`buildQuoteRequestBody` emit numbers, historical builder same, body-type test). Without this, W-14's E4 probes will reproduce the 400 `DH-905` and prove nothing about mappings.
3. **Dhan credentials provisioned via W-04 on Windows host** (DPAPI-protected carriers, `IIPS_DHAN_*_SECRET_PATH` vault URIs, DACL owner-only, re-read round-trip proven). W-06's credential pair is sufficient — no rotation required for this defect fix.
4. **Explicit authorization for the bounded E4 burst** — which instruments, which segments, maximum vendor `POST /marketfeed/quote` calls (recommend `96` for full P7 + `1` wrong-id + `4,680` only if owner-scoped subset, not full expansion blindly), off-market-hour allowance, and redaction reviewer.
5. **Rate-limit / entitlement confirmation** — Dhan Data-API subscription entitlement for the caller (W-06 400 was *not* entitlement, but entitlement was separately logged as operator concern in roadmap §10), plus IPD's 60/60s token-bucket, concurrency 8, bounded retry-transient-only respected.
6. **Disclosure reviewer named** — who will grep daemon stdout/stderr, IRR server logs, HTTP bodies, and the redacted evidence for secret values, transport token, `vault://`, carrier paths, and child-process output (per W-06 scan criterion: zero occurrences).

**Recommended but not blocking W-14 start:**

- D-5 recorded (W-13 shape) so mapping evidence records unavailable depth correctly.
- D-7 disclosure `MUST NOT` enforcement verified before publishing W-14 evidence (W-03 removal of paths already on roadmap; do not leak pointer material in the interim by manually redacting).

---

## 9. Recommended execution sequence — precise steps to complete W-14 without duplicating completed work

**Do not re-implement:** P7 manifest loading (`loadGovernedP7InstrumentRegistry`), exact-identity resolution (`resolveExactIdentity`), conflict detection, and qualifier gating — all implemented. Do not re-measure coverage (W-28) inside W-14; do not rebuild pipeline (W-27) inside W-14.

**Step 0 — Pin the evidence plane (1 day, no code):**
- Record which IPD commit is the W-14 baseline (propose `617fab0` plus W-12 fix branch, or converged candidate; record blob SHAs for `dhan_instrument_map.ts`, `dhan_api_client.ts` `buildQuoteRequestBody`, `dhan_dto.ts`, `dhan_normalizer.ts`, manifest path).
- Record which IRR commit will present evidence (`main` @ `b7927de` or later, but not required to move).
- Define the qualification sample in writing: all 96 P7 rows **as** the sample (48 NSE:EQ + 47 BSE:A + 1 BSE:B) plus an owner-scoped subset of W-27 new rows (e.g., top holdings gap from W-28 when Windows capture exists; otherwise none). State the exchange/series coverage explicitly.

**Step 1 — Land the W-12 fix (IPD, bounded) and prove it does not change mapping/identity:**
- Change only `buildQuoteRequestBody` (and historical body if same pattern) from string array to number array; add test `expect(JSON.parse(body).NSE_EQ[0]).toBeTypeOf('number')` and negativity check for string.
- Run IPD targeted suites (Dhan DTO/normalizer/mapping — the 160-case baseline) green; do not run full M2 claim.
- Publish as IPD PR with body noting it is **the only input-shape change** and linking to `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` §9.

**Step 2 — Bounded E4 probe: the sample against the vendor (Windows, authorized):**
- For each `(exchangeSegment, dhanSecurityId)` in sample, issue `POST /v2/marketfeed/quote` via daemon `POST /v1/quotes` with exact canonical `companyId` + `ISIN:isin:series`:
  - Record **redacted** vendor request body (numbers, segment) and **redacted** vendor response (keep non-secret fields: e.g., `ltp`, `previousClose`, `last_trade_time`, `securityId` echo if vendor returns one, `status`; strip any token/credential-adjacent field).
  - Record daemon's canonical `MarketQuoteEnvelope` (`ltp`, `previousClose`, `provenance.asOf`, `securityIdentity`, `exchangeSegment`) and map to mapping key — must be the same `companyId|exchangeSegment|ISIN:isin:series` that was sent.
  - Independently cross-check `ltp`/`previousClose`/`exchange` against a second source (e.g., owner's Dhan demat/last-close screen — explicitly not the vendor's own response) within tick tolerance; note session freshness (`GOOD` vs `STALE` vs `UNAVAILABLE` at NSE 09:15–15:30 IST) separately.
- For **one deliberately wrong id** (e.g., `dhanSecurityId` off-by-one in same segment), record that the daemon/vendor yields `UNRESOLVED_INSTRUMENT` or an obvious mismatch (not silent wrong price) — this is the stale-id signature.

**Step 3 — Document the mismatch signature:**
- One-paragraph mapping-failure taxonomy: `UNRESOLVED_INSTRUMENT` (mapping layer, no vendor call), vendor `HTTP_ERROR 400 / DH-905` (type error), vendor `404/UNKNOWN_INSTRUMENT` class (stale id), and obvious identity mismatch (vendor returns different `securityId` than requested). State which signature a stale `dhanSecurityId` produces per observed probe.

**Step 4 — Promotion decision:**
- For P7 rows with E4 confirmation, record `QUALIFIED` retained. For W-27 rows in scope with E4 confirmation, promote `PROPOSED → QUALIFIED` in an IPD-owned manifest update that **only** changes disposition (no pipeline re-run required; `lastVerifiedAt` added, pipeline commit unchanged). For rows without E4 or with mismatch, record `WITHHELD` with reason (e.g., `STALE_DHAN_ID`, `VENDOR_MISMATCH`, `INSUFFICIENT_EVIDENCE`).
- Publish sanitized per-row table (exchangeSegment, truncated holdingReference/masked ISIN pattern from W-28's privacy model, `reason` code, not raw ISIN in public evidence) and daemon `qualifiedMappings` count delta.

**Step 5 — Close the gate:**
- Update `MUST NOT` compliance grep over all W-14 artifacts (zero secret/`vault://`/carrier-path/child-process output, per D-7), and publish the evidence with contract version marker per W-07 (additive health now includes `CONNECTED_LIVE`/`LIVE_QUALIFIED`).

---

## 10. Outstanding decisions and blockers — mandatory vs recommendations

**Mandatory blockers (W-14 cannot produce E4 evidence without):**

| # | Blocker | Owner | Evidence it blocks |
|---|---|---|---|
| B-W14-1 | IPD serialization fix for `dhanSecurityId` numbers (HTTP 400 `DH-905` today) plus body-type test | IPD | Every live quote probe |
| B-W14-2 | Selection of live-capable daemon baseline with bounded E4 authorization + rate-limit/budget + disclosure reviewer | Operator + IPD | Any further vendor call; prevents silent re-run on disabled `PreAccessNoNetworkTransport` |
| B-W14-3 | Dhan credential + backend availability on Windows host (already attested for W-06; re-verify `liveResolutionSupported:true`, `vendorEgress=IPD_SERVER_HTTPS`) | Operator | Transport egress |

**Recommendations (do not block W-14, strengthen M2):**

| # | Recommendation | Why |
|---|---|---|
| R-1 | Record D-5 bid/ask absence shape before cross-checking values (W-13 sequencing) | Prevents `0` vs unavailable confusion in evidence table |
| R-2 | Add `vendorErrorCode`/`vendorHttpStatus` to IPD `HTTP_ERROR` (root-cause §7) | Preserves stale-id vs type-error distinction without echoing body |
| R-3 | Complete W-27 byte-reproducibility proof independently of W-14 | Prevents qualifying an incorrectly constructed expansion |
| R-4 | Define the owner-scoped W-27 subset for W-14 (holdings gap vs full 4,584) before promotion | Avoids blind qualification of irrelevant universe |
| R-5 | Retain the contradictory W-06 `PARTIALLY COMPLETE` vs `COMPLETE — OWNER ATTESTED` as two records with the latter governing progression, the former governing remaining documentary evidence | Avoids repeating W-06 execution unnecessarily while not claiming independent observation |

---

## Final conclusion

**Is W-14 ready to proceed?** **Yes — ready to execute under controlled E4, once B-W14-1 and B-W14-2 are cleared.** No new decision record is required; the scope, sample basis, exit criteria, and evidence standard are already normative in roadmap v1.1 §6/§10/§8. W-06 is progression-complete (owner-attested), W-12 is the only technical gate that must be sequenced first, and W-27's existing 96-row sample is sufficient to begin. W-27 expansion rows are *in-scope but deferred* — they are a promotion input, not a start blocker.

**What remains to complete it:** (a) the single-line IPD fix changing `dhanSecurityId` serialization from strings to numbers with a body-type test; (b) a bounded, authorized E4 burst over the 96-row NSE/BSE sample plus one wrong-id probe, each with redacted request/normalized-response/cross-check evidence and zero-secret grep; (c) a one-paragraph stale-id signature; (d) a disposition-only manifest update promoting only the E4-confirmed rows. Steps W-27/W-28/W-29 are not to be repeated inside W-14.

**Is an owner decision or additional authorisation required?** **Authorization — yes. Decision — no.** The owner must authorize live vendor access (instrument list, request count, off-hour window, and disclosure reviewer) and must state the live-capable IPD baseline (617fab0-family vs pin 1ce6a829 + fix). This is execution authorization with budget, not a new governance decision.

**Single recommended next action:** **Authorize IPD to land the `buildQuoteRequestBody` number-serialization fix on the W-06-attested baseline, and simultaneously grant the bounded 97-request E4 window (96 sample + 1 wrong-id) for W-14's mapping probe.** Execute nothing else — no new pipeline run, no full-suite gate, no consumer change — and publish the redacted per-row evidence as the first live mapping correctness record (M2's mapping half).

---

**Repo paths cited:** `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md:124-210,380-390,700-810,900-960`, `docs/integration/DHAN-LIVE-MARKET-DATA-CURRENT-STATE-INVESTIGATION-2026-11-11.md:§A/E/F/H`, `docs/integration/DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md:§3-9`, `docs/integration/DHAN-W06-ROADMAP-PROGRESSION-ASSESSMENT-2026-11-15.md:§1-3`, `docs/integration/DHAN-W28-COVERAGE-BLOCKER-2026-11-15.md`, `docs/integration/DHAN-W11-IRR-EXECUTION-2026-11-15.md`, `docs/integration/DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`, `docs/integration/B04-DHAN-68-ISIN-NSE-REASSESSMENT-2026-11-06.md`, `frontend/server/market-data/dhanMarketDataTransport.ts:48-90`, `frontend/node_modules/iips-production-market-data/dhan-server/index.js`, `frontend/server/w28/*`, `evidence/w28-coverage-summary.json`, `frontend/package.json:26-28` (pin `1ce6a829…`), `IIPS_V3_E2E_MASTER_TRACKER…` (commit `b7927de` line), `IIPS_V3_IID_IMPLEMENTATION_ROADMAP…` (`a988194d…`).  
**Commits/PRs referenced:** IRR `9e957ad`, `a624d06`, `1aee57f`, `901e4791e271cafdb777d56f9f66f6867b3f60c6`, `b52b6e5`, `752fb3e…`, `617fab0` (IPD attestation, per roadmap), `af4460ee…`, `bcfa6cb…`, IPD PR #164 `bcb45d7…` / manifest `371bf3bd…` / pipeline `325266d…`, IPD PR #156 (conformance), Python probe `2885` (number vs `\"2885\"` string).  
**Evidence classes per §8:** M1/M2a owner-attested E4 (IPD), current Reliance sample partial E4 with wrong serialization, all other mapping evidence E1/E2 synthetic — insufficient for M2.

