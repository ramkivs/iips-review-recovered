# W-14 Reconciliation against the new W-06 record (2026-11-23)

> **Post-PR-#627 / PR-#629 Recovery Note:** Recovered verbatim from PR #626 (`413d1b4b`). Subsequent to this snapshot, IRR PR #627 (`8f893112`) advanced the pinned IPD dependency from `1ce6a829…` to PR #176 (`2685562522f1a2fd1d745a7857f771bf21453315`) (satisfying `B-W14-1` pin advance) and PR #629 (`4059e045`) reconciled `D4-DR-01..03`. See master tracker `§16.326`.

**Date:** 2026-11-23 (UTC)  
**Type:** Investigation reconciliation — no IPD source modified, no live Dhan request made, no credential accessed, no Windows host touched.  
**Branch for this reconciliation:** `arena/f18beaf5-iips-review-recovered` @ `6f3e9a2` (base `b7927de65e55fab9519eecebd1c4cb0a73717bd6`)  
**Reconciled target:** `origin/main` @ `22a68a4` which merges PR #624 (W06 Snapshot-to-Live) via `774df7b` and PR #625 (W-29) via `3f3d61a` — the first commit that contains the new W-06 record.  
**Original investigation preserved:** `docs/integration/DHAN-W14-INVESTIGATION-2026-11-23.md` at `6f3e9a2` — **not modified, not superseded**. This document is an addendum that establishes exactly what the new record proves and how it changes (and does not change) the W-14 position.  
**Primary references verified in this checkout:**  
- New W-06 record: `docs/integration/W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md` (blob `8f77f90` at `774df7b`/`22a68a4`; PR #624 MERGED 2026-11-23T13:11:23Z, head `arena/0365f7c9-iips-review-recovered` `9654f78`)  
- Existing W-14 investigation: `docs/integration/DHAN-W14-INVESTIGATION-2026-11-23.md` at `6f3e9a2` (PR #626 OPEN as W-31)  
- Roadmap v1.1: `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` (ID `DHAN-LIVE-ROADMAP-2026-11-11`) — W-14 scope/exit in §6, M2 exit in §10.3, G-M2 evidence standard in §9  
- W-06 assessment: `docs/integration/DHAN-W06-ROADMAP-PROGRESSION-ASSESSMENT-2026-11-15.md` (PARTIAL, superseded by header attestation at IPD `617fab0` per roadmap p1)  
- Quote-API root cause: `docs/integration/DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` (string→number)  
- D-7 acceptance: `docs/integration/DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md` (effective `752fb3e` via PR #565/567)  
- W-11 execution: `docs/integration/DHAN-W11-IRR-EXECUTION-2026-11-15.md` / `DHAN-W11-CAPABILITY-GAPS-IPD-HANDOFF-2026-11-16.md`  

---

## 1. What the new W-06 record proves — verbatim

The record (PR #624) makes a single decision with two halves:

> **Decision B — W06 proceeds PARTIALLY, with explicit boundaries.** The repository-owned, read-only, revision-bound coverage *mechanism* is implemented and synthetic-tested in this pass (`frontend/server/market-data/dhanRevisionCoverage.ts` + `dhanRevisionCoverage.test.ts`). The *actual measurement* over `DHAN_PORTFOLIO` revision 1 remains **BLOCKED** on B02 (the revision's per-holding rows are in no repository and the host is operator-only) and is bounded by W04 (1 of 64 holdings has a stored identity). W06 is **NOT COMPLETE and NOT ACCEPTED**.

Evidence it adds (new in `774df7b`):

| Artifact | What it proves | What it does not prove |
|---|---|---|
| `dhanRevisionCoverage.ts` (388 lines, schema `iips.w06.dhan-revision-coverage/v1`) | A reusable, revision-bound aggregation exists: binds every report to `portfolioId`/`revision`/`provenanceDigest`/`capturedAt`, fails closed `CAPTURE_REF_INCOMPLETE` without digest, reports per-identity `COVERAGE_CURRENT \| STALE \| UNAVAILABLE \| UNKNOWN \| STATUS_UNREADABLE \| IDENTITY_UNRESOLVED`, calls existing DHAN-P3/P5 readers exactly once per resolved identity (no retry/refresh/write), deterministic, publishes `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED` verbatim | That any real portfolio was measured — the mechanism has **never run against the captured revision's rows** because those rows are host-only |
| `dhanRevisionCoverage.test.ts` (364 lines, vitest) | Synthetic readers exercise all 6 categories, UNKNOWN distinct from STALE/UNAVAILABLE, `STATUS_UNREADABLE` never fresh, exactly-once read-only calls, revision-binding, verdict mapping | Live vendor, live credential, live holdings |
| Tracker §16.321 | W06 now has an IRR-owned entry (previously none; latest was §16.320) | Acceptance — explicitly **NOT ACCEPTED** |

Live-state grounding (§1.1–1.5) re-confirms, with exact SHAs, why the record is structured this way:

- **B02 is the blocker** — `DHAN_PORTFOLIO` revision 1 has one import (64 holdings) but its per-holding rows live only on the Windows host as `frontend/server/user-portfolio/capture/` input; the capture file is local by design. No repository (IRR or IPD) holds the rows to measure.
- **W04 bounds the numerator** — `1 of 64 holdings identified, 63 unresolved` (tracker §16.286, IPD PR #166 merge `49742e3`, IRR PR #568 merge `0641953`). Even if B02 were supplied, only 1 identity could be resolved today without a new import (IPD PR #163 is a *future* import, not W06).
- **B03 narrowed, not settled** — Q1–Q6 open; mechanism reports qualification verbatim and claims no rights.
- **CI break diagnosed and already fixed** — PR #565 merge `3cc99a1` broke `main` via `verify-browser-bundle.test.mjs` collected by vitest; fix `7f6ca94a` (PR #567 `fa4e2987`) already on `main`; current `main` `b7927de`/`22a68a4` green (CI `45056360700`, CAP-03 Rev7 `45062387296`, Windows `45056360740`). No further CI correction needed.
- **IPD pin is correct** — `1ce6a829a7ce65550356a0071c108a60f2d813be` (published IPD `main`; W-07 PR #168 `10f326c`, W-08 #169, W-09 #170, W-10 `POST /v1/connection/verify`) is authoritative; `af4460ee` is PR-line-only and correctly retained only as `SUPERSEDED_IPD_W07_PIN_SHA` canary (W-29 boundary adds the same canary check via `quoteConsumptionBoundary.test.ts`).
- **Dhan W-06 progression signal unchanged** — roadmap header `W-06 COMPLETE — OWNER ATTESTED at IPD 617fab0` still supersedes the 2026-11-15 PARTIAL assessment; the record does not alter this.

**What is unchanged from the W-14 investigation's premises:** pin `1ce6a829a…`, IPD compare `af4460ee` PR-line status, W04 1/64, PR #565/567 diagnoses, D-7 acceptance, B02/B03 — the W-14 investigation at `6f3e9a2` already described these correctly.

---

## 2. Comparison with the existing W-14 investigation at `6f3e9a2`

The W-14 investigation (§3.1, §7, §10) treated Snapshot-to-Live W-06 as:

> Roadmap header `W-06 COMPLETE — OWNER ATTESTED at 617fab0` governs progression (prerequisite satisfied); the assessment's `PARTIALLY COMPLETE` (pending zero-secret grep) is a documentary gap, not a repeat-execution requirement. For W-14: **not a technical blocker** — a successful authenticated interaction is attested; a future E4 run must still pass its own zero-secret grep.

The new record does **not** contradict this, but it **refines** the dependency from a single bit ("W06 complete/incomplete") to two distinct claims that must be tracked separately:

| Claim | Old W-14 reading (pre-`774df7b`) | New reading after reconciliation |
|---|---|---|
| **(a) Mechanism for per-identity quote/freshness coverage of the captured revision** | Did not exist (W-28 is manifest-level, W05 is financial lifecycle). W-14 §9 Step 0–1 assumed W-06's deliverable was only the auth event. | **Exists now** — `dhanRevisionCoverage.ts` is the W05-precedent pattern (mechanism merged, measurement explicitly blocked). It is the *correct* W06 deliverable; W-14 must not rebuild it. |
| **(b) Actual measurement of revision 1** | BLOCKED on B02 (W04 1/64) — same as now, but described only as "no rows in repo". | **Still BLOCKED on B02, with sharper bound**: zero repository rows + 1/64 W04 ceiling + operator-only capture. Record explicitly says **W06 NOT COMPLETE and NOT ACCEPTED** — not a silent promotion to complete. |
| **(c) Progression signal for Dhan W-06** | `COMPLETE — OWNER ATTESTED at 617fab0` (roadmap header) governs; W-06 not a blocker for W-14. | **Unchanged.** The new record uses Dhan W-06's attestation as context but its own `NOT COMPLETE` refers strictly to *Snapshot-to-Live W06* (the per-identity coverage), not to Dhan W-06 auth. The two W-06s share a label but have different acceptance criteria — the reconciliation keeps them distinct (see §3). |

No other W-14 premises are invalidated. The mapping §4 inventory, vendor evidence §5, gaps G-1…G-9, D-7 disclosure, and execution prerequisites B-W14-1…3 remain accurate; see §4 for the targeted amendments they require.

---

## 3. Reconciled W-06 status — what this means precisely for W-14

**Important distinction (per tasking):** The new record's `mechanism delivered + measurement B02-blocked` must not be collapsed to either "W-06 fully unblocked" or "W-06 incomplete". The correct reading is:

1. **Snapshot-to-Live W06 = PARTIAL (mechanism only), NOT COMPLETE, NOT ACCEPTED.** This is the record's own verdict (§4, §8). The mechanism is independently testable and safe (read-only, fail-closed, deterministic, no auto-refresh, no IPD change). The measurement — the part that would produce a coverage number for the captured revision — has no evidence and none is claimed. Tracker §16.321 records this; it does not record acceptance.

2. **Dhan W-06 (first live auth on the Dhan roadmap) = COMPLETE — OWNER ATTESTED at IPD `617fab0` (roadmap p1).** This is a *different work item* that shares the W-06 label across two roadmaps. It establishes that a real credential resolved from the Windows store completed one authenticated vendor interaction (`POST /v2/marketfeed/quote` on `af4460ee` rebuilt host, `vendorEgress=IPD_SERVER_HTTPS`, `qualifiedMappings=96`, Reliance `ltp 1339.7`, `providerObservation 2026-11-13T10:29:51Z` → HTTP 200, root-cause report `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` explains the later 400 regression). This progression signal remains the authority for W-14's prerequisite.

3. **For W-14's dependency check, (2) is the prerequisite; (1) is the reusable mechanism.** W-14 is **not blocked** by Snapshot-to-Live W06's measurement gap, because W-14's own work is *live mapping correctness* (confirm vendor returns expected instrument for `(exchangeSegment, dhanSecurityId)` + stale-id signature), not *holdings coverage*. But W-14 **does reuse** (1)'s mechanism pattern: per-identity, revision-bound, read-only, exactly-once DHAN-P3/P5, fail-closed — the same discipline W-14's E4 probe must follow. No duplication is needed.

4. **No silent implication.** The existence of the mechanism does not imply the captured revision's rows are available, that W04's 1/64 will improve, that B03 is settled, or that the string→number quote defect is fixed. The record is explicit that those remain outstanding.

**Verdict for W-14:** The new record **confirms** W-14's prior "W06 unblocked for progression" conclusion while **tightening** its evidence plane (mechanism vs measurement must be cited separately). W-14 remains **OPEN, ready to execute under controlled E4 once B-W14-1 (IPD serialization fix) and B-W14-2 (baseline + budget + reviewer) are cleared** — same final conclusion as `6f3e9a2`, now on a stronger footing.

---

## 4. Reassessment — do any W-14 dependencies, gaps, or prerequisites change?

**Dependencies (roadmap Appendix A: `W-06 (W-12 recommended); W-27 for new rows`):**

| Dependency | New assessment |
|---|---|
| **W-06 (progression)** | **No change — still satisfied** via Dhan W-06 OWNER ATTESTED `617fab0`. Snapshot-to-Live W06 PARTIAL does not add a blocker; its mechanism is available to reuse. |
| **W-12 (quote wire)** | **No change — still the only technical execution blocker (B-W14-1).** Every W-14 `POST /v2/marketfeed/quote` will 400 `DH-905` until `buildQuoteRequestBody` emits numbers. Edit-sequencing W-12 before W-14 unchanged (`dhan_normalizer.ts` overlap). |
| **W-27 (new rows)** | **No change — not a start blocker.** 96-row P7 sample sufficient to begin; 4,680-row expansion stays `PROPOSED` until W-14 qualifies the owner-scoped subset. The record's parity gap note (SHA verified, no byte-repro proof) is consistent with W-14 §3.3/§6 G-7. |
| **W-13 / W-11 / W-28 / M2** | **No change.** W-13 sequencing (D-5) still recommended not blocking; W-11 PARTIAL still shares transport surface but not prerequisite; W-28 still orthogonal (construction→coverage→correctness triangle); M2 still `M2a → W-12 → W-13 → W-14 → M2`. |

**Gaps G-1…G-9:**

- **G-3 (serialization→400) — sharpened.** The new record's §3.5 lists the same defect as W-06 context but its mechanism does not fix it (intentionally out-of-scope). W-14's B-W14-1 remains **mandatory**.
- **G-6 (IPD pin divergence `1ce6a829…` vs `617fab0`) — confirmed.** The record fixes pin provenance (`af4460ee` PR-line-only, canary-retained) and confirms `1ce6a829…` as authoritative published `main`. The convergence question ("which baseline is W-14's daemon source?") is unchanged — still needs operator statement (propose `617fab0` + W-12 fix branch, or converged candidate `bcfa6cb…` + W-07…W-10; record `774df7b` file SHAs for `dhan_instrument_map.ts`, `dhan_api_client.ts`, `dhan_dto.ts`, `dhan_normalizer.ts`). W-14 §8 step 0 language is correct.
- **G-8 (bid/ask `0` vs unavailable) and G-9 (status cannot express live)** — unchanged.
- **New nuance for G-1/G-2 (unproven mappings / stale-id signature):** The record gives W-14 a concrete template for per-identity evidence (revision binding, exactly-once reads, deterministic, provider qualification verbatim). W-14's E4 probe should follow that pattern; it should **not** re-implement coverage measurement inside W-14. No gap is closed; the standard for closing it is clearer.

**Execution prerequisites B-W14-1…3:**

| Prerequisite | Reconciled status |
|---|---|
| **B-W14-1 IPD serialization fix + body-type test** | **Still mandatory, still owned by IPD.** No fix landed between `b7927de` and `22a68a4`; `dhanRevisionCoverage.ts` reuses readers but does not alter `buildQuoteRequestBody`. |
| **B-W14-2 live-capable baseline + bounded authorization + rate-limit + reviewer** | **Still mandatory.** Baseline selection (§4 Step 0) is unchanged; W-14 must record daemon baseline commit, IRR commit, and sample definition before any vendor call. The new record's §1.5 is the best current source for baseline provenance. |
| **B-W14-3 credential + backend `liveResolutionSupported:true` / `vendorEgress=IPD_SERVER_HTTPS`** | **Still mandatory, re-verify.** Attested for Dhan W-06 but W-14 must re-confirm on chosen baseline. |

**Recommendation unchanged:** Single next authorization is the **97-request E4 window (96-row P7 NSE:EQ48/BSE:A47/B1 sample + 1 wrong-id probe)** on the W-12-fixed baseline, each with redacted vendor request + daemon `MarketQuoteEnvelope` + independent value cross-check + zero-secret grep, publishing the stale-id signature (taxonomy: `UNRESOLVED_INSTRUMENT` vs `HTTP_ERROR 400/DH-905` vs `404/UNKNOWN_INSTRUMENT` vs obvious `securityId` mismatch). No new pipeline run, no full-suite gate, no consumer change.

---

## 5. Branch divergence and integration options — no merge attempted yet

**Divergence (per tasking):** This branch `arena/f18beaf5-iips-review-recovered` diverged from `main` at `b7927de` and carried independent work:

- `b52b6e5` W-28 exact ISIN+exchange matcher + registry loader + CLI + 11-condition tests (also on this branch)
- `2c4d18e` W-31 watchlists sourced price via W-29 boundary (+ `15ab8d8` ref-w29 merge `3f3d61a` subtree + `df55137`/`30c6911`)
- `6f3e9a2` W-14 investigation (this branch's PR #626 OPEN as "W-31 — Watchlists: sourced price display" — title is branch-level, not this doc's scope)

`origin/main` at `22a68a4` diverged separately:

- `774df7b` MERGED PR #624 (W06 snapshot-to-live record + `dhanRevisionCoverage.ts` + tests + tracker §16.321)
- plus W-15 commits `0cd5967`/`9654f78` (identity picker) merged via `774df7b`
- then `22a68a4` MERGED PR #625 (W-29 shared consumption boundary `quoteConsumptionBoundary.ts` + `dhanIdentityJoined.test.tsx` + `.ci/verify-ipd-pins.mjs` / workflows)

The two lines are **unrelated histories for merge purposes** (`git merge origin/main` → `refusing to merge unrelated histories` without `--allow-unrelated-histories`; not used — per tasking, no merge or history rewrite was attempted in this pass). File-level content is compatible — `W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md` (blob `8f77f90`, 115 lines) is the only integration doc present on `main` but absent here; W-28 coverage files are present here but not on `main` at `b7927de`; no filename collision.

**Available integration options (assessment only, no execution):**

| Option | What it does | When to use |
|---|---|---|
| **A. Publish reconciliation from this branch (chosen for this pass)** | Publish this addendum on the existing PR #626 branch, preserving W-14 investigation and its history. `main` moves independently. | **Now** — evidence reconciliation without risking PR #626 work, per tasking. |
| **B. Cherry-pick `774df7b` content onto this branch** | Copy `W06-…-COVERAGE-2026-11-23.md` + `dhanRevisionCoverage.*` + tracker §16.321 onto this branch so both records coexist for review. | If reviewers want a single-branch view; requires a clean additive commit, no history rewrite of `main`. |
| **C. Open a new branch from `22a68a4` for follow-on W-14 authorization** | Future W-12 fix + W-14 E4 evidence live on a branch that already contains the W06 record. | When live execution is authorized (W-12 fix + baseline selection). |
| **D. Merge with `--allow-unrelated-histories`** | Full history union. | **Not recommended** — rewrites the divergence narrative; use only if a maintainer explicitly requests it and PR history is preserved. |

**This pass chose A** — no merge, no cherry-pick, no rebase, no force-push to `main`. The next Arena task remains reconciliation/authorization, not live execution, and the accurate W-14 position (OPEN, B-W14-1/2-gated, mechanism available, measurement B02-blocked, pin `1ce6a829…` authoritative) is now recorded without disturbing PR #626.

---

## 6. Conclusion — reconciled W-14 position

- The new W-06 record **does not unblock** W-14 by itself (measurement still B02-blocked), and it **does not block** W-14 (progression still via Dhan W-06 attestation `617fab0`; mechanism now available).
- W-14 remains **OPEN**; dependencies not satisfied are unchanged (W-12 fix first); gaps G-1…G-9 and prerequisites B-W14-1…3 are unchanged in substance, with tighter wording on mechanism vs measurement and baseline provenance.
- **No new owner decision is required** to authorize the *scope* of W-14 (roadmap v1.1 §6 governs it). **Execution authorization is required** before any vendor call (bounded sample, request budget 96+1, live-capable baseline, off-hour window, disclosure reviewer) — same as before, now with the new record as supporting evidence.
- The **next Arena task is not execution** — it is publication of this reconciliation and maintainer review of integration options before any live qualification.

---

**Artifacts cited:** `W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md` (`8f77f90` @ `774df7b`/`22a68a4`, PR #624), `DHAN-W14-INVESTIGATION-2026-11-23.md` (`6f3e9a2`), roadmap `DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` v1.1, `DHAN-W06-ROADMAP-PROGRESSION-ASSESSMENT-2026-11-15.md`, `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`, `DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`, `DHAN-W11-IRR-EXECUTION-2026-11-15.md`, `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` §16.321/§16.320/§16.286, `frontend/server/market-data/dhanRevisionCoverage.ts` + `.test.ts`, `frontend/server/market-data/quoteConsumptionBoundary.ts` (W-29), `frontend/package.json` pin `1ce6a829a7ce65550356a0071c108a60f2d813be`, IPD PRs #156/#164/#166/#167/#168, `617fab0`/`af4460ee`/`bcfa6cb…`/`1ce6a829…`/`774df7b`/`22a68a4`/`b7927de`/`6f3e9a2`.  
**Repo state at write:** `HEAD` `6f3e9a2` (this branch `arena/f18beaf5-iips-review-recovered`, base `b7927de`), `origin/main` `22a68a4` (includes `774df7b`). No IPD access attempted; no merge performed.
