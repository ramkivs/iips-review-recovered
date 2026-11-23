# Snapshot-to-Live W06 — per-identity quote and freshness coverage for the captured revision: live-state investigation, decision and partial delivery (2026-11-23)

**Date:** 2026-11-23 (UTC)
**Branch:** `arena/0365f7c9-iips-review-recovered` from `main` `b7927de65e55fab9519eecebd1c4cb0a73717bd6`
**Repositories:** IRR `ramkivs/iips-review-recovered` (read/write, this branch); IPD `ramkivs/iips-production-market-data` (read-only intent; **all API access from this sandbox returned 403** — repo, branches, contents and pulls endpoints; consistent with the access limitation retested and recorded on 2026-11-18 in `IPD-WORK-HANDOFF-2026-11-17.md`). No IPD write was performed or attempted; no Windows host was accessed; no vendor call was made; no credential was read; no production data was used. Synthetic fixtures only.

**Decision: B — W06 proceeds PARTIALLY, with explicit boundaries.** The repository-owned, read-only, revision-bound coverage *mechanism* is implemented and synthetic-tested in this pass (`frontend/server/market-data/dhanRevisionCoverage.ts` + tests). The *actual measurement* over `DHAN_PORTFOLIO` revision 1 remains **BLOCKED** on B02 (the revision's per-holding rows are in no repository and the host is operator-only) and is bounded by W04 (1 of 64 holdings has a stored identity). W06 is **NOT COMPLETE and NOT ACCEPTED**.

---

## 1. Live state established on 2026-11-23 (Phase 1)

### 1.1 W06 tracker entry and acceptance criteria

- The IRR master tracker (latest entry §16.320, 2026-11-22) had **no Snapshot-to-Live W06 entry**; this pass adds §16.321.
- The Snapshot-to-Live roadmap itself is **IPD-held** (`docs/integration/IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md`); the latest IRR-held read-back is blob `7affba55a5ba568333fdc2961a322c2f76b4c671` at IPD `main` `2685562522f1a2fd1d745a7857f771bf21453315` (W05 at lines 148–149, per `W05-ROADMAP-RECONCILIATION-2026-11-17.md`). Live re-read is currently impossible from this sandbox (403).
- Per the IRR-held roadmap references (`W07-FINANCIAL-LIMITATION-RESOLUTION-2026-11-12.md` §6): **"W03 -> W04 -> W06 (once authorized non-production host access B02 and market/financial source-rights B03 are supplied)"**. W06's outstanding deliverable: **per-identity quote and freshness coverage for the captured revision**.

### 1.2 W03 / W04 / B02 / B03 current status

| Item | Live status (2026-11-23) | Evidence |
|---|---|---|
| W03 (actual inventory; acceptance: "counts reconcile to captured revision, empty/unavailable/unknown distinguished") | **PARTIAL** — repository-only inventory delivered; actual counts blocked by B02 | `IIPS-CURRENT-PORTFOLIO-STAGE-2-IRR-RECORD-2026-11-10.md` §2 |
| W04 (actual security/issuer coverage) | **ACCEPTED AS MEASURED** 2026-11-16: 1 of 64 holdings identified, 63 unresolved; identity coverage explicitly not complete | tracker §16.286; IPD PR #166 merge `49742e3648ae1563914326ec9a76c68f84b9dc3f`; IRR PR #568 merge `064195397dfdb32bf0f34a461b02fd6b9f9a8df0` |
| B02 (authorized non-production host access) | **Not available to Arena.** Operator-run host outputs of 2026-11-16 exist on IPD `main`; the 2026-11-13 capture file is local to the host by design | Stage-2 record §7 table; tracker §16.286 evidence limitations 2–3 |
| B03 (source rights: "unknown, not denied"; narrowed, not settled) | **NARROWED, NOT SETTLED.** NSE/BSE terms and governing law read; Q1–Q6 open, Q7 closed evidence-limited (PA-directed); D1 confirmed, D2 decided | `W05-STATEMENT-SOURCE-RIGHTS-AND-REPOSITORY-EXPOSURE-ASSESSMENT-2026-11-17.md`; `W05-RIGHTS-QUESTIONS-Q1-Q7-ADDENDUM-2026-11-17.md`; tracker §16.290 |

### 1.3 IRR PR #565 — what merged, what broke CI, is main still affected

- **Merged** 2026-11-16T13:20:01Z, merge commit `3cc99a1f170cd19771f992160d903f8b8cb9fee3` ("Dhan integration progress: W-11 partial and W-28 blocked"): D-7 acceptance record, W-06/W-11/W-28 docs, market-data route/transport/test changes, `frontend/scripts/verify-browser-bundle.mjs` (+ its node:test suite), `scripts/w28_verify_manifest.py`, `tools/windows/capture-w11-observation.ps1`, pin-adjacent test updates.
- **CI failure cause:** the PR-head check run `43874026297` ("Typecheck · Test · Build") FAILED, and the post-merge `main` run `43874761511` at `3cc99a1f` FAILED the same way. The sole failing step was CI's "Run the full Vitest suite": the new `frontend/scripts/verify-browser-bundle.test.mjs` is a `node:test` suite with zero vitest tests, but vitest's default include collected it and aborted the whole run with `No test suite found in file scripts/verify-browser-bundle.test.mjs` (exit 1, **no failing tests**). This is documented verbatim in the fix commit `7f6ca94ac9`.
- **Is main still affected? NO.** The smallest safe correction was already merged via **PR #567**, commit `7f6ca94ac9` ("CI: exclude the node:test browser-bundle suite from vitest discovery"), which adds `scripts/**` to the vitest exclude in `frontend/vite.config.ts` (present on current `main` at line 37) while the suite still runs under `node --test` (3/3). Post-fix `main` run `43923969498` at `fa4e2987` = SUCCESS. Current `main` `b7927de`: latest runs all **success** — CI `45056360700`, CAP-03 Rev7 static `45062387296`, Windows focused `45056360740` (2026-11-22). (A separate Windows-focused failure at `408f3afb` on 2026-11-22 was remediated by later merged fixes; latest Windows run at `e5245b28` is green.) **No further CI correction is required or made in this pass.**

### 1.4 IRR PR #567 — live status (not draft)

- **MERGED** 2026-11-16T17:58:38Z, merge `fa4e298791be8a0f68ffa7521736539bcce722bd`, head `arena/4bdc1e8b-iips-review-recovered`. The historical "draft" status is superseded.
- Scope: W-07 IRR leg (governed D-7 health-mirror compatibility; `dhanHealthState`/`dhanHealthTransport` fail-closed contract validation), **IPD pin advanced `af4460ee…` → `5b384c7215b2644a8d525960ba05cd97f39bf7a7`** (head of IPD PR #168, ancestor of IPD `main` `10f326cb…`), pin-guard canaries, and the vitest-discovery CI fix above.
- Effect on W06: it repaired the main CI break caused by #565 and hardened the market-data transport tests; it does **not** deliver Snapshot-to-Live W06 (no captured-revision coverage).

### 1.5 IPD PRs #156, #158, #167, #168 and commit `af4460e` (Phase 1, items 6–7)

Live API verification is blocked (403 from this sandbox), so the statuses below are the **IRR-recorded read-backs with exact SHAs**, which this pass verified for internal consistency:

- **IPD PR #156** — "W-01 + W-02: Windows VaultProvider, DPAPI backend…" (open as of the 2026-11-13 CPII discovery); it also carries the **W-06 (Dhan) conformance record** whose operator-reported census is the sole source of the three zero counts in the W04 census (tracker §16.286, limitation 2; `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` §2).
- **IPD PR #158** — no current IRR read-back located; treat as **unverified from this sandbox** rather than assuming a status.
- **IPD PR #164** — MERGED 2026-11-15T16:14:34Z, merge `bcb45d7db8f4b8baf542761593f82f32e803e488` (W-27 immutable qualification manifest, 4,680 qualified mappings).
- **IPD PR #166** — MERGED 2026-11-16T19:54:56Z, merge `49742e3648ae1563914326ec9a76c68f84b9dc3f` (W04 evidence reconciliation and acceptance assessment; head of IPD `main` when read).
- **IPD PR #167** — the **unmerged identity-contract candidate line**. IRR records tie it to commit `af4460eeab9bb0544e009322526a5498df0d5909`: the 2026-11-15 read-back (`DHAN-W11-IPD-CONFIGURATION-HANDOFF-2026-11-15.md`) shows IPD `main` `901e4791…` and the pin `af4460ee…` diverge (compare API: 37 commits ahead / 35 behind, direction main → pin), so **`af4460ee…` is NOT an ancestor of IPD `main`** — it is available only on that PR line, not from the authoritative branch. PR #567's commit message records that on the pinned candidate "the 200/UNAVAILABLE answer existed only on the unmerged identity-candidate line" and that its `health()` rejected the governed live D-7 values.
- **IPD PR #168** — MERGED 2026-11-16T17:35:35Z, merge `10f326cb3c84794ee15666add982abc624d22f3a`; head `5b384c72…` = the published W-07 `ServiceHealth` contract, ancestor of IPD `main`.
- **Which IRR files pin(ed) `af4460e`:** `frontend/package.json` + `frontend/package-lock.json` pinned `iips-production-market-data` at `af4460ee…` until PR #567 advanced it (then `d80d773…` via W-10/PR #569, now **`1ce6a829a7ce65550356a0071c108a60f2d813be`** — the published IPD `main` merge carrying W-07 PR #168, W-08 PR #169, W-09 PR #170 and W-10's `POST /v1/connection/verify`). The pin is enforced by `.ci/verify-ipd-pins.mjs` and by pin-guard tests; `af4460ee…` survives only as the `SUPERSEDED_IPD_W07_PIN_SHA` canary in `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` so a silent rollback fails loudly.
- **Repository-owned resolution if the pin is not available from the authoritative branch:** do NOT pin a PR-line commit for a main-based integration; pin the **published IPD `main` merge commit**. That resolution is already in place at `1ce6a829…` on `main`; nothing in this pass changes any pin.

---

## 2. W06 deliverable vs existing implementation (Phase 2)

The outstanding deliverable — **per-identity quote and freshness coverage for the captured revision** — decomposes as follows, and every component already existed except the final aggregation:

1. **Captured revision**: the W11-DEP1 owner-bound capture (`frontend/server/user-portfolio/capture/`) reads `portfolio.list → portfolio.get → portfolio.revisions → portfolio.get` and binds one `revision` + `provenanceDigest`; IRR PR #568 / W09 made the consumer revision-aware. `DHAN_PORTFOLIO` revision 1 = one import, 64 holdings.
2. **Identity per market-data row**: the stored D114 `securityIdentity` (`ISIN:<isin>:<series>`) on each holding, projected into the resolver input (IRR PR #568 commits `7f3f7db`, `8765860`). W04 measured: **1 of 64 stored, 63 unresolved**.
3. **Quote observation association**: `POST /api/dhan/quotes` (DHAN-P3, `dhanMarketDataRoutes.ts`) requires the canonical identity and reports the resolved `securityId` on the view.
4. **Freshness**: `GET /api/dhan/freshness?domain=D01_QUOTES&companyId&exchangeSegment&securityId` (DHAN-P5, `dhanFreshnessRoutes.ts`) — IPD evaluates age against its governed threshold; verdicts `GOOD | STALE | UNAVAILABLE | UNKNOWN` echoed verbatim; `GOOD` maps to IRR `SNAPSHOT` (never `LIVE`).
5. **Missing observations**: IPD `UNKNOWN` (no observation at all) is carried verbatim and mapped to `UNAVAILABLE` for the badge while staying distinguishable as `UNKNOWN` in the view — distinct from `STALE` (concession active) and `UNAVAILABLE` (suppressed/missing evidence). A freshness read that fails is a transport failure, never "fresh".
6. **Revision binding**: every report must carry `portfolioId` + `revision` + `provenanceDigest`; without the digest the measurement fails closed.
7. **Reusable Dhan quote implementation**: yes — DHAN-P3/P5 over IPD's pinned client; this pass reuses `projectIpdFreshnessStatus` and `mapIpdVerdictToIrrFreshness` rather than duplicating them.
8. **Reliability without automatic refresh or captured-data changes**: the new aggregator calls only the existing read-only readers, exactly once per resolved identity, and writes nothing.

**Gap closed in this pass:** the per-identity aggregation over a captured revision did not exist (W-28's verifier is manifest-level, not holdings-level; the W05 lifecycle is financial coverage, not quote/freshness coverage). Added: `frontend/server/market-data/dhanRevisionCoverage.ts` + `dhanRevisionCoverage.test.ts`.

---

## 3. Dependency and governance assessment (Phase 3)

- **W03**: PARTIAL — mechanism inventoried; actual counts BLOCKED on B02. Not a code blocker for the W06 mechanism.
- **W04**: ACCEPTED AS MEASURED (1/64). Bounds the revision-1 numerator at 1 from repository-available data; the 63 need a later import (IPD PR #163 per §16.286) — future import work, not W06 work.
- **B02**: operator-only host access; Arena has none. **Blocks the actual W06 measurement** (revision-1 rows are in no repository).
- **B03**: narrowed, not settled (Q1–Q6 open). Market-data source rights for quote coverage remain unverified; the W06 mechanism therefore reports the provider qualification verbatim (`SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`) and claims no rights.
- **Dhan integration readiness**: Dhan-roadmap W-06 (first live auth) is **COMPLETE — OWNER ATTESTED** at IPD `617fab0…` (supersedes the 2026-11-15 partial assessment); but provider qualification remains `SYNTHETIC_ONLY_NOT_LIVE_QUALIFIED`, live quote/historical qualification (W-12/W-14) is not established, and the quote API has a recorded input-shape defect (`DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`). Any actual observation read is therefore pre-access/synthetic-grade until P7 live qualification. This does not block the mechanism; it bounds what a measurement could claim.
- **IRR/IPD compatibility**: current pin `1ce6a829…` is a published IPD `main` merge; verified by `.ci/verify-ipd-pins.mjs` in CI. `af4460ee…` is PR-line-only and must not be pinned for the main-based integration.

Separation of blocker classes: **technical blockers** — none for the mechanism (built and tested); **missing external evidence** — B02 host access + revision-1 rows (blocks actual measurement); **governance approvals** — B03 source-rights narrowing for market data, and W06 acceptance itself (not requested, not claimed); **implementation work** — the aggregation (done in this pass); **already completed** — W04 acceptance-as-measured, Dhan W-06 owner attestation, W-07/W-10 IRR legs, main CI green.

## 4. Decision (Phase 4)

**B — W06 can proceed partially, with explicitly identified boundaries.**
- Proceeds now: the IRR-owned, read-only, revision-bound per-identity quote/freshness coverage **mechanism**, independently testable with synthetic fixtures, published through this repository-owned branch and PR.
- Does not proceed: any actual measurement over `DHAN_PORTFOLIO` revision 1 (BLOCKED on B02 and bounded by W04's 1/64), any live-qualification claim (SYNTHETIC_ONLY), any refresh/automatic behavior, any change to captured data, any IPD change.
- Not A (full proceed) because the acceptance-relevant evidence (captured-revision rows on the host) is unavailable; not C (full wait) because the repository-only mechanism is exactly the W05-precedent pattern (mechanism merged, actual coverage explicitly blocked) and is safe, authorized under the standing grant, and independently testable; not D because no new governance decision is required to keep the mechanism read-only and fail-closed.

## 5. Work completed in this pass (Phase 5)

- `frontend/server/market-data/dhanRevisionCoverage.ts` — the W06 coverage aggregator (schema `iips.w06.dhan-revision-coverage/v1`): binds every report to the exact captured revision (`portfolioId`/`revision`/`provenanceDigest`/`capturedAt`, fail-closed `CAPTURE_REF_INCOMPLETE` without a digest); per identity reports quote presence/absence (with the identity-failure vs data-failure distinction preserved), IPD's verbatim verdict, the DHAN-P5 projected freshness view, `asOf`/`ageSeconds`/concession/suppression flags; categories `COVERAGE_CURRENT | COVERAGE_STALE | COVERAGE_UNAVAILABLE | COVERAGE_UNKNOWN | STATUS_UNREADABLE | IDENTITY_UNRESOLVED`; exactly one read-only quote + freshness call per resolved identity (no retry, no refresh); deterministic; provider qualification published verbatim.
- `frontend/server/market-data/dhanRevisionCoverage.test.ts` — vitest suite (synthetic readers only): revision binding, fail-closed capture validation, all six categories with UNKNOWN distinct from STALE/UNAVAILABLE, STATUS_UNREADABLE never fresh, exactly-once read-only calls, totals, determinism, verdict mapping.
- This record + tracker §16.321.
- **Local verification (sandbox):** functional run of the module via `tsx` against the synthetic readers — all assertions passed ("ALL W06 COVERAGE CHECKS PASSED"); targeted strict `tsc --noEmit` over the new files and their import graph — clean. Full `npm ci`/vitest cannot run in this sandbox (the private IPD package is 403 here); the PR's hosted CI (`ci.yml`) runs the suite with the pinned package — see PR checks.
- **No changes to:** pins, workflows, IPD, the Windows host, captured data, W03/W04/W05 statuses, or any unrelated work. Main CI was diagnosed (see §1.3) and requires **no further correction** — the #565-caused failure was already remediated by #567; nothing was merged by this pass.

## 6. Remaining work and next action (Phase 6 pointer)

- Actual W06 measurement over revision 1: **BLOCKED** — needs the operator-supplied captured-revision input bundle (same mechanism as `W05-W04-RECONCILIATION-2026-11-18.md` §4–5) under B02; until then no revision-1 coverage figure exists and none is claimed.
- The 63 unresolved identities: future import work with prerequisite IPD PR #163 (not W06).
- Live qualification (W-12/W-14, P7) and the quote input-shape defect: IPD/Dhan-roadmap owned; out of W06 scope.
- B03 market-data source rights: open questions Q1–Q6; owner/counsel act.
- IPD-side roadmap status line for W06: IPD-owned; not changed from IRR.
- **Next action in the Snapshot-to-Live roadmap:** stay on **W06** — the operator supplies the revision-1 captured input bundle on the authorized host so the delivered coverage mechanism can be run against the exact captured revision; W06 is then re-assessed for acceptance. Do not silently move to W07/W08+ (W07's L-038/L-039 remain OPEN on external evidence).

## 7. PRs created/updated, commits, tests, CI

- This branch `arena/0365f7c9-iips-review-recovered` → PR (number assigned on creation) carrying exactly: the two new market-data files, this record, and tracker §16.321. Exact commit SHAs are reported post-push (a commit cannot contain its own hash).
- IRR PRs referenced (live-verified via API this pass): #565 MERGED `3cc99a1f` (CI failure diagnosed, remediated by #567); #567 MERGED `fa4e2987`; #566 OPEN (`arena/8bfe7d67`, W04 supersession record, untouched); #568 MERGED `0641953`; #602 MERGED (broker-import pin to IPD main `12a3d625`).
- CI: main `b7927de` green (runs listed in §1.3); PR-head CI for this branch is reported by GitHub on the PR.

## 8. W06 tracker recommendation

W06 = **PARTIAL — mechanism delivered and synthetic-tested; actual per-identity coverage of the captured revision BLOCKED on B02, bounded by W04 (1/64); NOT ACCEPTED.** Recorded as tracker §16.321.
