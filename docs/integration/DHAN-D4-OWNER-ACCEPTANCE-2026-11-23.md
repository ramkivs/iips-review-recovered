# DHAN D-4 — Owner Acceptance & Joint Governance Sign-Off Record (2026-11-23)

**Decision ID:** `D-4` (`D-4.1` through `D-4.7`) — D02 / D114 / PIT / IID / NP-04 Architecture & Boundary Alignment (Option C)  
**Proposal Record:** [`docs/integration/DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md`](DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md)  
**Supporting Architecture Assessment:** [`docs/integration/DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md`](DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md)  
**Governance Precedents:** [`docs/integration/DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`](DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md), [`docs/integration/DHAN-W24-OWNER-DECISION-PROPOSAL-2026-11-21.md`](DHAN-W24-OWNER-DECISION-PROPOSAL-2026-11-21.md)  
**Repository:** `ramkivs/iips-review-recovered` (IRR), branch `arena/fbeebd7c-iips-review-recovered`  
**Joint Counterpart Repository:** `ramkivs/iips-production-market-data` (IPD), verified at `main` `84e988b092058df8075ffa52f5dfb0f4fef07eaf` (PR #176 at `2685562522f1a2fd1d745a7857f771bf21453315`)

---

## 1. Executive Acceptance Summary

| Governance Axis | Recorded Status | Scope & Conditions |
|---|---|---|
| **Program Authority / Owner Disposition** | **APPROVED (`approve_all_d4`)** | Owner formally approved `D-4.1` through `D-4.7` as proposed on **2026-11-23** (`ask_user` selection: *"Approve D-4.1 through D-4.7 as proposed: Formally accept D-4.1 through D-4.7 ... for IRR (and record joint IPD/IRR status)"*). |
| **IRR Acceptance Status** | **ACCEPTED FOR IRR** (on branch `arena/fbeebd7c-iips-review-recovered`; effective on IRR `main` upon merge) | Adopts Option C and all seven sub-decisions `D-4.1`–`D-4.7` for IRR without changing runtime `W-20` code in this work item. |
| **IPD Joint Sign-Off Status** | **OWNER-APPROVED; IPD REPOSITORY PUBLICATION PENDING** | Because D-4 spans both IPD (`D02` / `D114` / `PIT` / `W-19` / `D-1`) and IRR (`W-20` / `W-11` / `W-29` / `NP-04` / `IID`), the owner's `approve_all_d4` approval applies to the joint architectural contract; an IPD-side mirror acceptance record must still be committed in `ramkivs/iips-production-market-data` before cross-repo `W-20` execution begins (this IRR session does not write to IPD). |
| **Effective Scope Limits** | **Design & Sequencing Gate Only** | Acceptance of `D-4` **does not** trigger `W-20` code changes, **does not** authorize live Dhan `E4` bursts (97-request quote run or historical probe), and **does not** lift `B2`/`CV-32` non-production restrictions on `/api/pit/market-data`. |

---

## 2. Formally Accepted Sub-Decisions (`D-4.1` – `D-4.7`)

All seven sub-decisions from [`DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md`](DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md) §11–§12 are accepted verbatim:

1. **`D-4.1` — Adopt Option C (Dual-Layer Architecture):**
   - `D01_QUOTES` (live/cached snapshot quotes via IPD `/v1/quotes`) and `D02_OHLCV` (historical OHLCV series via IPD `/v1/historical` / `/v1/freshness?domain=D02_OHLCV`) operate as **provider-backed market-data read layers** governed by `D-7`, `D-8`, `W-29`, and `W-19` freshness/cache rules.
   - `D114` / `PIT` (`iips-production-market-data/pit`, IRR `/api/pit/market-data`) remains the **immutable, non-production, research/simulation Point-in-Time snapshot layer** (20-record runtime fixture store, `B2`/`CV-32` gated), and **must never** be bypassed, silently rewritten from live Dhan polls, or conflated with live `D01`/`D02` feeds.
   - `NP-04` (`iips-np04-governed-persistence`) remains the **sole governed persistence boundary** for assessment reports and audit artifacts (`reports-transport.ts`).

2. **`D-4.2` — Preserve `B2` / `CV-32` Non-Production PIT Gate:**
   - `/api/pit/market-data` and `iips-production-market-data/pit` remain strictly non-production and fail-closed (`CV-32` / `PKG-05-PIT-CV32-DISPOSITION-PACKET.md`). Production admission of any PIT-backed capability remains a separate governed gate.

3. **`D-4.3` — Maintain `IID` `R-6` / `Q-5` & `D02` History Gate:**
   - `IID` intelligence readiness (`R-6` / `Q-5`: `PIT_D01 -> DATASET_EOD -> withhold`) and `margin.ts` corporate-action/data-sufficiency refusal rules remain intact. `W-20` historical routes may expose raw `D02_OHLCV` series with explicit provenance/freshness (`isAdjusted: false` / `coverageClaim: 'ACCESS_PENDING_UNVERIFIED'` until vendor-verified) and **must not** fabricate adjusted histories or override `IID` withhold verdicts.

4. **`D-4.4` — Preserve `W-29` Shared Quote Boundary & `W-11` Transport Discipline:**
   - All IRR server quote consumers route through the shared `W-29` consumption boundary (`dhanMarketDataRoutes.ts` / `dhanMarketDataTransport.ts`); future `W-20` `D02` historical routes must follow the same server-side authenticated loopback IPD transport boundary and fail-closed `D-7` disclosure rules.

5. **`D-4.5` — Decouple `W-06` Live Quote Freshness Gate from `W-14` `E4` Qualification:**
   - As reconciled across PR #624 (`W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md`) and PR #626 (`DHAN-W14-RECONCILIATION-W06-2026-11-23.md`):
     - `W-06` **Live Quote Freshness** (`PARTIAL`, blocked by `B02` on live quote-freshness continuity and `W-04` `1/64` held-universe coverage) remains tracked separately from `W-14` **E4 Qualification**.
     - `W-14` (`97` unique P7 holdings; bounded `E4` live quote run) remains blocked on its explicit owner execution authorization (`B-W14-2` / `B-W14-3`) and prerequisite IRR pin advancement (`B-W14-1` — executed in this branch's companion pin advance to PR #176 `26855625`).

6. **`D-4.6` — Require `W-12` Historical Request-Builder & `G-08`/`G-12` Verification Before Any Live `D02` Execution:**
   - No live Dhan `/v2/charts/historical` `E4` request or `W-20` implementation may assume that PR #176's quote serializer fix resolved historical requests.
   - The companion verification record [`DHAN-W12-HISTORICAL-REQUEST-VERIFICATION-2026-11-23.md`](DHAN-W12-HISTORICAL-REQUEST-VERIFICATION-2026-11-23.md) establishes the verified facts and unresolved vendor-contract gaps (`securityId` string serialization, `/charts/intraday` absence, provisional interval vocabulary `'1m'|'5m'|'15m'|'1h'|'1D'`, `isAdjusted` policy) that govern `W-12` historical completion and bounded `E4` historical probing.

7. **`D-4.7` — Sequencing Rule (`W-12` → `W-17`/`W-14` → `W-19` → `W-20`):**
   - `W-20` (IRR historical `D02` route/UI exposure) remains **deferred** behind:
     1. **Joint IPD + IRR `D-4` Sign-off** (IRR accepted here; IPD mirror record pending);
     2. **`W-12` Historical Request-Builder Verification & Bounded `E4` Historical Schema Qualification** (including resolution of `securityId` wire type and interval/endpoint contract against Dhan `/v2/charts/historical`);
     3. **`W-17` / `W-14` Live Qualification** (`97`-request `E4` quote run under separate owner authorization + D01/D02 DTO field-shape qualification);
     4. **`W-19` D02 Historical Cache & Freshness Integration** in IPD (`DhanHistoricalCache`, `DAILY_CLOSE` calendar evaluation).

---

## 3. Joint IPD + IRR Governance Checklist

| Requirement | Owner / Repo | Status | Evidence / Next Action |
|---|---|---|---|
| Architecture assessment (`D02` vs `D114` / `PIT`) | IRR | **COMPLETE** | `docs/integration/DHAN-D02-VS-D114-PIT-ARCHITECTURE-ASSESSMENT-2026-11-23.md` |
| D-4 owner decision proposal (`D-4.1`–`D-4.7`) | Joint (authored in IRR) | **COMPLETE** | `docs/integration/DHAN-D4-OWNER-DECISION-PROPOSAL-2026-11-23.md` |
| Program Authority approval (`D-4.1`–`D-4.7`) | Program Authority | **APPROVED (2026-11-23)** | Owner `ask_user` response `approve_all_d4` |
| IRR acceptance record & `main` merge | IRR | **RECORDED ON BRANCH** (pending PR merge to `main`) | This document (`docs/integration/DHAN-D4-OWNER-ACCEPTANCE-2026-11-23.md`) |
| IPD mirror acceptance / alignment record | IPD (`ramkivs/iips-production-market-data`) | **PENDING IPD PUBLICATION** | Record `D-4.1`–`D-4.7` acceptance in IPD `docs/integration/` and update IPD execution roadmap / `W-19`/`W-20` preconditions (no IPD writes performed by this IRR session) |
| Master tracker reconciliation (`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`) | IRR | **OPEN FOLLOW-UP** | Update tracker `D-4` row once this branch and PR #626 are merged to `main` |

---

## 4. Explicit Non-Claims & Boundaries

- **No `W-20` implementation performed:** Zero `D02` routes, UI components, or PIT changes were written.
- **No live Dhan egress performed or authorized:** Neither the `97`-request `W-14` quote run nor a single `/v2/charts/historical` probe was executed or authorized by `D-4` approval.
- **Independent workstream statuses preserved:** `D-4` (`OWNER-APPROVED; IRR ACCEPTED ON BRANCH; IPD MIRROR PENDING`), `W-12` (`QUOTE SERIALIZER MERGED IN IPD PR #176 & PINNED IN IRR; HISTORICAL BUILDER VERIFIED UNMODIFIED / LIVE CONTRACT UNPROVEN`), and `W-14` (`B-W14-1 PIN ADVANCE PREPARED ON BRANCH; B-W14-2 / B-W14-3 OWNER E4 AUTHORIZATION & PR #626 MERGE PENDING`) remain independently tracked.
