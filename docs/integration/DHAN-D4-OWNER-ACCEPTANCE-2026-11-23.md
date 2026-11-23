# DHAN D-4 — Owner Acceptance & Joint Governance Sign-Off Record (2026-11-23)

**Decision ID:** `D-4` (`D-4.1` through `D-4.7`) — D02 / D114 / PIT / IID / NP-04 Architecture & Boundary Alignment (Option C)  
**Proposal Record:** [`docs/integration/DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md`](DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md) (canonical decision text at **§7**; decision list at **§20**)  
**Supporting Architecture Assessment:** [`docs/integration/DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md`](DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md)  
**Governance Precedents:** [`docs/integration/DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`](DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md), [`docs/integration/DHAN-W24-OWNER-DECISION-PROPOSAL-2026-11-21.md`](DHAN-W24-OWNER-DECISION-PROPOSAL-2026-11-21.md)  
**Repository:** `ramkivs/iips-review-recovered` (IRR), branch `arena/fbeebd7c-iips-review-recovered` (initial acceptance commit `b9d6c2f1aaee351d3583bc0789357c0373386932`, merged to IRR `main` at `8f89311273afc9c488db1144aed5112511613a53` via PR #627; amended by this discrepancy-correction erratum)  
**Joint Counterpart Repository:** `ramkivs/iips-production-market-data` (IPD), verified at `main` `84e988b092058df8075ffa52f5dfb0f4fef07eaf` (PR #176 at `2685562522f1a2fd1d745a7857f771bf21453315`; IPD mirror acceptance `IPD:docs/integration/D-4-D02-D114-PIT-MIRROR-ACCEPTANCE-2026-11-23.md` published at `447b86e2585b95fdea4627b90faa4fd3cc3bcf60`, merged to IPD `main` at `df74b50018c3bc4de083446e33de8609148455d6` via IPD PR #191)

---

## 1. Executive Acceptance Summary

| Governance Axis | Recorded Status | Scope & Conditions |
|---|---|---|
| **Program Authority / Owner Disposition** | **APPROVED (`approve_all_d4`)** | Owner formally approved `D-4.1` through `D-4.7` as proposed on **2026-11-23** (`ask_user` selection: *"Approve D-4.1 through D-4.7 as proposed: Formally accept D-4.1 through D-4.7 ... for IRR (and record joint IPD/IRR status)"*). |
| **IRR Acceptance Status** | **ACCEPTED FOR IRR (`8f893112`, PR #627) — ERRATUM RECONCILED** | Adopts Option C and all seven canonical sub-decisions `D-4.1`–`D-4.7` (Proposal **§7** and **§20**) plus the four IRR operational/sequencing conditions (§2.1), without changing runtime `W-20` code. This revision applies IRR's corrective erratum for `D4-DR-01`, `D4-DR-02`, and `D4-DR-03` logged in IPD mirror acceptance §5. |
| **IPD Joint Sign-Off Status** | **COMPLETE — IPD MIRROR ACCEPTED (`df74b500`, IPD PR #191)** | `IPD:docs/integration/D-4-D02-D114-PIT-MIRROR-ACCEPTANCE-2026-11-23.md` (`IPD-D4-MIRROR-ACCEPTANCE-2026-11-23`) merged to IPD `main` on **2026-11-23**, adopting canonical `D-4.1`–`D-4.7` and recording IPD's open obligations (`W-19`, `D01`/`D02` boundary symmetry, `D02` series digest, impossible-date guard in `validateDhanHistoricalRequest`). |
| **Effective Scope Limits** | **Design & Sequencing Gate Only** | Acceptance of `D-4` **does not** trigger `W-20` code changes, **does not** authorize live Dhan `E4` bursts (`97`-request quote run or historical probe), and **does not** lift `B2`/`CV-32` non-production restrictions on `D114/PIT` or `/api/pit/market-data`. |

---

## 2. Formally Accepted Canonical Sub-Decisions (`D-4.1` – `D-4.7`)

All seven canonical sub-decisions approved by the owner (`approve_all_d4`) are defined at [`DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md`](DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md) **§7 ("The Seven D-4 Decision Areas (`D-4.1` – `D-4.7`)")** and **§20 ("Explicit Owner Decisions Requested")** (with supporting failure/fallback and freshness policy details at **§11–§12**):

1. **`D-4.1` — Source Authority by Use Case (Adopt Option C — Dual-Layer Architecture):**
   - `D02_OHLCV` (Dhan historical OHLCV via IPD `POST /v1/historical` / IRR `POST /api/dhan/historical` and `/v1/freshness?domain=D02_OHLCV`) answers historical charting, intraday candles (`1m..1h`), and ad-hoc date-range price inspection (`<= 1,825` days), subject to `W-12`/`W-13`/`W-14`/`W-19` preconditions and `D-4.2`–`D-4.6` rules.
   - `IID` valuation and Margin of Safety retain the existing **`R-6` / `Q-5` rule** (`PIT_D01 -> DATASET_EOD -> withhold`) and `margin.ts` corporate-action / data-sufficiency refusal checks (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`).
   - `D114` / `PIT` remains the **immutable, non-production Point-in-Time snapshot layer** reserved for point-in-time (`asOf`) replay and future backtesting (`B2`/`CV-32` gated), strictly separate from live `D01`/`D02` feeds. In **IRR**, `GET /api/pit/market-data` queries IRR's 20-record in-memory runtime fixture store (`12` D114 TCS + `8` mock records). In **IPD**, PIT exposes **no HTTP route** and instead publishes non-production library subpaths (`./pit`, `./d114-non-production` with three archived Bhavcopy fixtures: `2024-06-28` legacy, `2026-01-05` UDiFF, `2026-02-10` UDiFF) plus a library-only append-only durable store (`src/pit/pit_durable_store.ts`) isolated from the Gate 3 / Gate A′ schema.
   - `NP-04` (`iips-np04-governed-persistence`) remains the **sole governed persistence boundary** for assessment reports and audit artifacts (`reports-transport.ts`), embedding immutable price observations per `D-4.7`.

2. **`D-4.2` — Source Selection and Failure Behaviour (No Silent Fallback, No Blending):**
   - Every IRR consumer/request explicitly declares its capability (`range_ohlcv -> D02`, `pit_as_of -> D114/PIT`, `valuation_mos -> IID R-6`).
   - A source failure (`400/401/429/502/503/504`) or empty result (`returnedCandleCount === 0`) surfaces as an **explicit typed failure or explicit empty result** — **never** silently substituting `D114/PIT` for `D02` (or live Dhan for `PIT`), and **never** stitching/blending candles across sources (Proposal §7 `D-4.2`, §11, §20 item 2).
   - Every historical payload and UI surface must display explicit source identification (`DHAN_D02_OHLCV` vs `D114_PIT` vs `DATASET_EOD`), requested-vs-returned counts, `coverageClaim`, and `isAdjusted`.

3. **`D-4.3` — Truthful D02 Freshness (Unknown Stays Unknown):**
   - Eliminate the contradiction where IRR's `projectIpdHistoricalResult` (`frontend/server/market-data/dhanMarketDataRoutes.ts:485`) hardcodes `freshness: 'SNAPSHOT'` on `D02` series even while IPD `GET /v1/freshness?domain=D02_OHLCV` returns `cacheState: 'NOT_AVAILABLE'`, `verdict: 'UNKNOWN'`, `timestampEvidence: 'NOT_AVAILABLE'` (Proposal §7 `D-4.3`, §12, §20 item 3).
   - Report `D02` freshness strictly from IPD `D02_OHLCV` evidence using the four-timestamp model: `marketTimestamp` (latest candle end), `providerResponseTimestamp`, `retrievalTimestamp` (`receivedAt`), and `cacheTimestamp` (`evaluatedAt`).
   - Until IPD `W-19` wires `DhanHistoricalCache` and `W-14` qualifies `D02` live, IRR must report `D02` freshness truthfully as **`UNAVAILABLE`** (or `UNKNOWN` per IPD evidence) — never fabricating `SNAPSHOT` or `LIVE`.

4. **`D-4.4` — Corporate-Action Adjustment Policy:**
   - While `D02` reports `isAdjusted: false` (declared pre-access alongside `coverageClaim: 'ACCESS_PENDING_UNVERIFIED'`), all charts and historical tables must render an explicit *"Unadjusted for corporate actions (splits/bonuses/dividends)"* disclosure.
   - Raw `isAdjusted: false` `D02` candles are **prohibited** from driving split-sensitive valuation or portfolio return attribution until corporate-action adjustment is verified and modelled; `margin.ts`'s hard refusal (`UNADJUSTED_PRICE_ACROSS_CORPORATE_ACTION`) is preserved unchanged.

5. **`D-4.5` — D114/PIT Admission Gate (Retain `B2` / `CV-32` Non-Production Boundary):**
   - Keep Gate `B2` and `CV-32` (`API-ONLY`, `P4 retained, NOT ADMITTED`) intact for `/api/pit/market-data` and IPD `./pit` / `./d114-non-production` during `W-20`.
   - Wider product admission requires durable storage (replacing IRR's 20-record in-memory runtime fixture store; note IPD already has a library-only durable store `pit_durable_store.ts` with no HTTP route and no product admission), verified NSE+BSE Bhavcopy ingestion beyond the existing fixture archives, 4-timestamp temporal metadata (`marketDate`, `publishedAt`, `ingestedAt`, `revisedAt`), and an explicit PA admission packet superseding `B2`/`CV-32` — plus, for backtesting, an `asOf` range-over-time query contract, deterministic correction/restatement handling (`supersedesVersion`), an `asOf`-aligned corporate-action factor timeline, and digest verification.

6. **`D-4.6` — D01/D02 Exact Security-Identity Symmetry:**
   - Close the `H-5` boundary asymmetry between `D01` and `D02`: both `POST /api/dhan/quotes` (`D01`) and `POST /api/dhan/historical` (`D02`) must require **exact canonical identity** (`companyId` + `ISIN:<isin>:<series>` + `exchangeSegment` `NSE_EQ|BSE_EQ`), rejecting `companyId`-only historical ambiguity at the governed boundary — or at minimum requiring `exchangeSegment` + canonical `securityId` when `W-20` activates (Proposal §7 `D-4.6`, §15, §20 item 6).
   - Mapping provenance (`manifestCommit`, `pipelineCommit`, `lastVerifiedAt`, `isinAuthority`) must match `W-27`/`W-28`'s exact matcher (no symbol, company-name, or fuzzy matching), and wrong-ID protection (`UNRESOLVED_INSTRUMENT`) must apply identically to `D01` and `D02`.
   - **W-27 qualification status (`D4-DR-02` reconciled):** Verified IPD `84e988b0` manifests (`evidence/dhan-w27/expansion-manifest.json`, `evidence/dhan-p7/qualification-report.md`) establish that all **`4,680`** rows (`NSE:EQ` `2,390`, `BSE:A` `700`, `BSE:B` `1,590`) — i.e., all `4,584` net additions above the earlier pre-2026-11-15 `96`-row P7 sample — are **already statically qualified and registered** (`counts.alreadyQualified: 4680`, `counts.proposedAdditions: 0`, `countsByDisposition.PROPOSED_ADDITION: 0`) and loaded by `loadGovernedP7InstrumentRegistry`. **Static qualification is NOT live qualification:** all `4,680` mappings remain tagged `providerQualification: 'SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED'` and remain gated by `W-14` `E4` live qualification and `W-27` byte-reproducibility parity before live-qualified promotion or reliance.

7. **`D-4.7` — Persisted Report Reproducibility (Immutable `NP-04` Embedding):**
   - Every `NP-06` report (`reports-transport.ts`) or `IID` assessment referencing market prices must embed an immutable **`HistoricalPriceEvidence`** block inside the persisted `NP-04` payload (`source`, `securityIdentity`, `marketTimestamp`, `observationTimestamp`/`retrievalTimestamp`, `dataValues`, `adjustmentStatus`, `sourceProvenance` incl. `dataVersion`/`lineageHash`/`coverageClaim`, `schemaVersion`, `completeness`).
   - Reading a stored report renders the embedded block verbatim; generating a new version records a new evidence block for deterministic side-by-side diffing. *(Open IPD prerequisite recorded in IPD mirror acceptance §3 `D-4.7` and §6 item 3: IPD must emit a D02 series-level `dataVersion`/`lineageHash` digest to complete D02 provenance parity with D01.)*

---

### 2.1 Approved Supplementary IRR Operational & Sequencing Conditions

*(Originally accepted alongside `D-4.1`–`D-4.7` in IRR PR #627 and cross-mapped in IPD mirror acceptance §4 as additive non-conflicting IRR conditions:)*

1. **`W-29` Shared Quote Boundary & `W-11` Transport Discipline:** All IRR server quote consumers route through the shared `W-29` consumption boundary (`dhanMarketDataRoutes.ts` / `dhanMarketDataTransport.ts` / `quoteConsumptionBoundary.ts`); future `W-20` `D02` historical routes must use the same server-side authenticated loopback IPD transport boundary and fail-closed `D-7` disclosure rules.
2. **Decouple `W-06` Live Quote Freshness Gate from `W-14` `E4` Qualification:** As reconciled across PR #624 (`W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md`) and PR #626 (`DHAN-W14-RECONCILIATION-W06-2026-11-23.md`), Snapshot-to-Live `W-06` (`PARTIAL`, blocked by `B02` and `W-04` `1/64`) is tracked independently from `W-14` (`97`-request bounded `E4` quote qualification, gated on explicit owner execution authorization `B-W14-2`/`B-W14-3`; `B-W14-1` pin advance to PR #176 `26855625` completed in PR #627).
3. **Require `W-12` Historical Request-Builder & `G-08`/`G-12` Verification Before Any Live `D02` Execution:** No live Dhan `/v2/charts/historical` `E4` request or `W-20` implementation may assume PR #176's quote serializer fix resolved historical requests; [`DHAN-W12-HISTORICAL-REQUEST-VERIFICATION-2026-11-23.md`](DHAN-W12-HISTORICAL-REQUEST-VERIFICATION-2026-11-23.md) records the unresolved vendor-contract gaps (`securityId` string serialization, `/charts/intraday` absence, provisional intervals, `toDate` exclusivity, `isAdjusted` policy) plus IPD mirror acceptance §6 item 4 (`validateDhanHistoricalRequest` impossible-date guard).
4. **Strict Implementation Sequencing (`W-12` → `W-17`/`W-14` → `W-19` → `W-20`):** `W-20` remains deferred behind (i) Joint IRR + IPD `D-4` acceptance (now complete), (ii) `W-12` historical builder verification & bounded owner-authorized `E4` historical schema probe, (iii) `W-17`/`W-14` live qualification, and (iv) IPD `W-19` D02 cache/freshness integration, `D01`/`D02` boundary identity symmetry (`D-4.6`), D02 series digest (`D-4.7`), and IRR pin advance to at least IPD `84e988b0` (or the subsequent IPD commit implementing those prerequisites).

---

## 3. Joint IPD + IRR Governance Checklist

| Requirement | Owner / Repo | Status | Evidence / Next Action |
|---|---|---|---|
| Architecture assessment (`D02` vs `D114` / `PIT`) | IRR | **COMPLETE** | `docs/integration/DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md` |
| D-4 owner decision proposal (`D-4.1`–`D-4.7`) | Joint (authored in IRR) | **COMPLETE** | `docs/integration/DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md` (§7, §20) |
| Program Authority approval (`D-4.1`–`D-4.7`) | Program Authority | **APPROVED (2026-11-23)** | Owner `ask_user` response `approve_all_d4` |
| IRR acceptance record & `main` merge | IRR | **MERGED (`8f893112`, PR #627)** | `docs/integration/DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md` (erratum reconciled in this revision) |
| IPD mirror acceptance / alignment record | IPD (`ramkivs/iips-production-market-data`) | **MERGED (`df74b500`, IPD PR #191)** | `IPD:docs/integration/D-4-D02-D114-PIT-MIRROR-ACCEPTANCE-2026-11-23.md` (`IPD-D4-MIRROR-ACCEPTANCE-2026-11-23`, published `447b86e2`) |
| IRR discrepancy corrections (`D4-DR-01`..`D4-DR-03`) | IRR | **ADDRESSED ON THIS BRANCH** | This erratum + reconciled Proposal/Assessment records (pending PR review & merge to `main`) |
| Master tracker / decision register reconciliation | IRR | **OPEN FOLLOW-UP** | Record `D-4` in `IRR_SCOPED_WORKPACKAGES_PROGRESS_REGISTER` / master decision register once this PR merges |

---

## 3A. Discrepancy Corrections Reconciled Against IPD Mirror Acceptance (`D4-DR-01` – `D4-DR-03`)

Source record: `IPD:docs/integration/D-4-D02-D114-PIT-MIRROR-ACCEPTANCE-2026-11-23.md` §5 (merged at `df74b50018c3bc4de083446e33de8609148455d6`, IPD PR #191).

| ID | Discrepancy Reported by IPD | Verified IPD Evidence | Corrective Action Applied in IRR |
|---|---|---|---|
| **`D4-DR-01`** | Initial IRR acceptance §2 cited Proposal `§11–§12` instead of `§7` and `§20`, renumbered `D-4.2`–`D-4.7`, and omitted explicit restatement of canonical `D-4.2`, `D-4.3`, and `D-4.6`. | `DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md` §7 (`D-4.1`–`D-4.7`), §20 (items 1–7); `IPD-D4-MIRROR-ACCEPTANCE-2026-11-23` §4, §5. | Realigned §2 above one-to-one to canonical Proposal **§7** and **§20** (explicitly restoring `D-4.2` no silent fallback/blending, `D-4.3` truthful D02 freshness, and `D-4.6` D01/D02 exact-identity symmetry), while preserving the four IRR operational/sequencing conditions in **§2.1**. |
| **`D4-DR-02`** | Proposal (`§4`, `§7 D-4.6`, `§15`, `§18`, `§20 item 6`) stated that `4,584` W-27 net addition rows (`4,680 - 96`) *"remain `PROPOSED` (unloaded by daemon)"*. | IPD `84e988b0`: `evidence/dhan-w27/expansion-manifest.json` (`counts.proposedAdditions: 0`, `counts.alreadyQualified: 4680`, `countsByDisposition.PROPOSED_ADDITION: 0`, `baseline.qualifiedMappings: 4680`); `evidence/dhan-p7/qualification-report.md` (`QUALIFIED: 4680`, `registry size: 4680`, `NSE:EQ 2390 / BSE:A 700 / BSE:B 1590`, *"Static instrument-master evidence only: no live quote qualification"*). | Updated `D-4.6` above and reconciled Proposal `§4`, `§7 D-4.6`, `§15`, `§18`, and `§20 item 6`: all `4,680` entries are **statically qualified and registered** (not `PROPOSED`), while remaining **`SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`** (not live-qualified) until `W-14` `E4` qualification and `W-27` byte-reproducibility parity complete. |
| **`D4-DR-03`** | Initial IRR acceptance §2 `D-4.1` described `D114/PIT` (`iips-production-market-data/pit`, IRR `/api/pit/market-data`) generically as a *"20-record runtime fixture store"*, conflating IRR's runtime test fixture store with IPD's PIT boundary. | IPD `84e988b0`: `package.json` (`./pit`, `./d114-non-production`; no HTTP route), `src/d114/non_production_pit_population.ts` (`2024-06-28` legacy + `2026-01-05` & `2026-02-10` UDiFF Bhavcopy fixtures), `src/pit/pit_durable_store.ts` (durable library-only append-only SQLite store isolated from Gate 3/Gate A′, no HTTP route, no product admission). | Updated `D-4.1` and `D-4.5` above (plus Proposal and Assessment cross-references) to distinguish IRR's 20-record in-memory runtime fixture store (`GET /api/pit/market-data`) from IPD's three archived Bhavcopy fixtures (`./d114-non-production`) and IPD's durable library-only PIT store (`pit_durable_store.ts`, no HTTP route). |

---

## 4. Explicit Non-Claims & Boundaries

- **No `W-20` implementation performed:** Zero `D02` routes, UI components, or PIT changes were written.
- **No live Dhan egress performed or authorized:** Neither the `97`-request `W-14` quote run nor a single `/v2/charts/historical` probe was executed or authorized by `D-4` approval.
- **Approved decisions and ownership preserved:** This erratum alters zero approved `D-4.1`–`D-4.7` architectural requirements and performs zero writes to `ramkivs/iips-production-market-data`.
- **Independent workstream statuses preserved:** `D-4` (`OWNER-APPROVED; IRR ACCEPTED 8f893112; IPD MIRROR ACCEPTED df74b500; ERRATUM PENDING MERGE`), `W-12` (`QUOTE SERIALIZER MERGED IN IPD PR #176 & PINNED IN IRR PR #627; HISTORICAL BUILDER VERIFIED UNMODIFIED / LIVE CONTRACT UNPROVEN`), and `W-14` (`B-W14-1 PIN ADVANCE MERGED AT 26855625; B-W14-2 / B-W14-3 OWNER E4 AUTHORIZATION & W-14 DOC MERGE PENDING`) remain independently tracked.
