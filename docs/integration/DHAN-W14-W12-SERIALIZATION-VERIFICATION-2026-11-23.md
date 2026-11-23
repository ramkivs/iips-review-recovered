# W-14 — W-12 Serialization Status and Reconciliation Publication Verification (2026-11-23)

**Date:** 2026-11-23 (UTC)  
**Branch:** `arena/f18beaf5-iips-review-recovered` (base `b7927de65e55fab9519eecebd1c4cb0a73717bd6`, `origin/main` at reconciliation `22a68a4`)  
**Head at write:** `413d1b4b6881885f60986341ab1cd732a4f45031` (parent `6f3e9a2c025a74da3db7722b0869dce4a7f7da0b`)  
**PR:** #626 `W-31 — Watchlists: sourced price display` (OPEN, `headRefOid` `413d1b4` verified 2026-11-23T15:39Z)  
**Type:** Focused evidence review — no IPD source modified, no live Dhan request made, no credential accessed, no Windows host touched. Checks IPD only by read; all vendor calls are historical evidence cited, not executed here.  
**Documents verified in this checkout:**  
- `docs/integration/DHAN-W14-INVESTIGATION-2026-11-23.md` @ `6f3e9a2` (SHA `4a71fbd11e9f53fd4f36aaf245a6a914c682ad2f`, 41055 bytes) — original W-14 investigation  
- `docs/integration/DHAN-W14-RECONCILIATION-W06-2026-11-23.md` @ `413d1b4` (SHA `785e95dda2ebd0712705796296411e625ac6cead`, 19860 bytes) — reconciliation addendum  
- `docs/integration/DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` — serialization root cause (string `[\"2885\"]` → 400 `DH-905/813`, number `[2885]` → 200)  
- `docs/integration/DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` (ID `DHAN-LIVE-ROADMAP-2026-11-11` v1.1, `W-12` §356, `W-14` §380, Appendix A)  
- `docs/integration/DHAN-W06-ROADMAP-PROGRESSION-ASSESSMENT-2026-11-15.md` and `W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md` (blob `8f77f90` @ `774df7b`/`22a68a4`, PR #624)  
- `frontend/package.json` pin `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` (W-07 PR #168 `5b384c72`, W-08 #169 `75db511`, W-09 #170 `a402eee`, W-10 `POST /v1/connection/verify`)  

**Sandbox limitation re-confirmed in this pass:** Direct verification of IPD PR #176 implementation is blocked from Arena — `gh api repos/ramkivs/iips-production-market-data` returns `403 Resource not accessible by integration` (token `arena-egress-dummy-token`); `git ls-remote https://github.com/ramkivs/iips-production-market-data.git` returns `403 Write access to repository not granted`; `GET https://codeload.github.com/ramkivs/iips-production-market-data/zip/1ce6a829` returns `404 Not Found` for the IPD host in this egress context. This is consistent with every prior IPD access block recorded (`IPD-WORK-HANDOFF-2026-11-17.md`). `frontend/node_modules/iips-production-market-data` is absent in this checkout (`ls` reports `No such file or directory`; `npm ci` not runnable without egress). The findings in §§1–2 therefore distinguish **reported evidence** from **independently verified evidence** and name the exact artifacts that close the gap.

---

## 1. PR #176 implementation and merge evidence — what is reported vs what is independently verified

### 1.1 What the task asserts

The tasking states IPD PR #176 — *numeric security-ID serialization correction* — is **merged** and has a **successful live Reliance quote HTTP 200** produced by the corrected path. This is taken as the provenance claim to be checked, not as verified fact until independently observed.

### 1.2 What can be established from IRR-side evidence in this checkout

| Claimed item | IRR-observable fact | Evidence |
|---|---|---|
| PR #176 title | **Numeric security-ID serialization correction** (`B-W14-1` blocker: `buildQuoteRequestBody` string→number) | Root-cause doc `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md` §3–5, §8: IPD `buildQuoteRequestBody` emitted `{ "NSE_EQ": ["2885"] }` (strings) → HTTP 400 `DH-905/813` → `HTTP_ERROR`; required fix is `{ "NSE_EQ": [2885] }` (numbers) + body-type test `expect(JSON.parse(body).NSE_EQ[0]).toBeTypeOf('number')` |
| Working reference | **Python `requests.post(json=payload)` with `[2885]` → HTTP 200** (number, not string) confirms vendor contract | Same doc §2; independent of IPD |
| IPD-side correction ownership | **IPD owns the fix** — IRR has no `DhanApiClient`, no `buildQuoteRequestBody`, no `dhan_api_client.ts`; IRR only consumes `MarketDataTransportClient.getQuote/getHistorical/health` via `frontend/server/market-data/dhanMarketDataTransport.ts` + `dhan-server/index.js` stub (`0.0.0-stub`) | `frontend/package.json` dependency `iips-production-market-data#1ce6a829a…`, `.ci/verify-ipd-pins.mjs` (pins `1ce6a829`, `12a3d625`, `2e11fa3b`); `find` for `dhan_api_client*` returns 0 in IRR |
| Current IRR pin | **`1ce6a829a7ce65550356a0071c108a60f2d813be`** is a published IPD `main` merge (W-07…W-10), verified by `.ci/verify-ipd-pins.mjs` in CI | `gh api repos/ramkivs/iips-review-recovered/contents/.ci/verify-ipd-pins.mjs` + `frontend/package.json:26-28`; CI at `b7927de`/`22a68a4` green |
| PR #176 merge status | **Not independently verified in this pass** — IPD API and git ls-remote are 403 from this sandbox (see header). No IRR-local artifact asserts the merge SHA. | Blocked calls listed in header; no IRR file names PR #176 as merged |

### 1.3 Gap: the exact IPD commit and files that would prove the correction

To close PR #176 independently, the IPD-side reviewer must publish:

1. **IPD PR #176 merge commit SHA** on `iips-production-market-data@main` (and its merge timestamp, e.g. `2026-11-xxTxx:xx:xxZ`) — not a candidate branch head.
2. **Implementation files at that SHA with blob SHAs:** `src/dhan/dhan_api_client.ts` (or equivalent `buildQuoteRequestBody`) showing `JSON.stringify({ NSE_EQ: securityIdsAsNumbers })` / numeric array construction; and the **historical request builder** if it shared the string pattern (tasking §1.4 asks for separation — quote vs historical are distinct; historical path uses `POST /v2/marketfeed/history` or `/v1/historical` via `getHistorical`; its body builder must be checked separately and reported as *same-fix applied* or *not applicable with reason*).
3. **Test files that enforce numeric JSON:** e.g. `src/dhan/dhan_api_client.test.ts` or `tests/dhan_serialization.test.ts` containing `expect(JSON.parse(body)[segment][0]).toBeTypeOf('number')` and negative guard for strings, plus CI run ID showing pass on the merge commit.
4. **Live Reliance evidence that exercises the same builder:** A redacted W-12/W-06 transcript whose request body is the output of `buildQuoteRequestBody` (not a hand-typed literal), showing `{"NSE_EQ":[2885]}` → HTTP 200 with IPD's `DhanTransport` redacted diagnostics (`vendorHttpStatus:200`, `vendorErrorCode` absent, `providerObservation` timestamp, `ltp` value) and zero-secret grep pass.

Absent those four artifacts, PR #176 is **reported merged** but **unverified** from this sandbox. The IRR pin `1ce6a829…` predates the tasking's asserted fix date (pin is W-07…W-10, not W-12); whether `1ce6a829…` already contains the numeric fix can only be answered by comparing `1ce6a829…` against the PR #176 merge SHA — that comparison is the remaining verification step.

---

## 2. W-14 request-path verification — does the corrected implementation cover the W-14 quote path?

### 2.1 The W-14 quote path (authoritative)

Per roadmap `W-14` §6 and root-cause doc §3: W-14 uses **`POST /v2/marketfeed/quote`** via IPD's `DhanApiClient.buildQuoteRequestBody` → `DhanServerHttpsTransport` (origin-pinned `https://api.dhan.co`, `access-token`/`client-id` bare headers, `Content-Type: application/json`, `redirect:'error'`, bounded `AbortSignal.timeout`) → IPD daemon `POST /v1/quotes` → IRR `createIpdMarketDataTransportClient().getQuote()`. The exchange segments are literal `NSE_EQ`/`BSE_EQ` (`dhanMarketDataRoutes.ts:286`).

### 2.2 Checklist (task §1.2–1.6)

| Check | Result in this pass | Evidence / gap |
|---|---|---|
| **1. PR #176 merged into IPD main** | **Reported, not independently verified** | Task assertion; IPD API returns 403 (header). IRR has no local merge record. Needs IPD maintainer to state merge commit SHA. |
| **2. `buildQuoteRequestBody` serializes as numbers** | **Reported by task as corrected; not inspectable in this checkout** | IRR has no `DhanApiClient` source (`find` 0). Root-cause doc §8 prescribes the fix; task asserts it landed. Needs IPD file/blob SHA (see §1.3.2). |
| **3. W-14 quote path uses corrected impl** | **Expected — but depends on (2) + pin provenance** | If (2) holds at IPD `main`, and IRR's consumed pin advances from `1ce6a829…` to at least the PR #176 merge SHA, then W-14's `POST /v2/marketfeed/quote` uses the corrected builder. If the pin stays at `1ce6a829…` and that commit predates the fix, W-14 would still execute the old string path. Current pin in this branch is `1ce6a829…` (no update in `413d1b4`). Whether `1ce6a829…` already equals or includes PR #176 is **the critical unverified predicate**. |
| **4. Any separate serializer still emits strings** | **Two paths must be checked separately** | Quote builder (in scope for W-14) vs historical builder (W-12's second item in root-cause doc §8: "and the corresponding historical request builder if it shares the pattern"). Historical path existence/shape is not verified here; IPD must state `applicable / not-applicable with reason` for that file. |
| **5. Tests verify numeric JSON not string** | **Not verified** | IRR has no such test (no `buildQuoteRequestBody` in IRR). IPD must publish test file + assertion + CI run. |
| **6. Reliance 200 evidence exercises same builder** | **Not verified — needs chain-of-custody** | Task asserts a successful Reliance live quote. For it to prove W-14's path, the evidence must show the HTTP 200 was produced by the daemon's `buildQuoteRequestBody` output (redacted body with numbers), not by a parallel Python `requests` literal. That linkage is the gap between root-cause doc §2's Python 200 and an IPD-pinned live run. |

### 2.3 Why this matters for the distinction in tasking §1

The W-14 investigation's `B-W14-1` conflated two issues: the **quote serialization** (string→400, blocks every W-14 probe) and the **broader W-12 wire qualification** (field-shape vs `dhan_normalizer.ts` — `last_trade_time` format, `net_change`, `ohlc.close` semantics, depth arrays). PR #176 addresses only the first. Verifying (3) as SATISFIED therefore **does not satisfy all of W-12**; W-12's DTO/normalizer verification (roadmap `W-12` §356: "compare against `dhan_dto.ts`/`dhan_normalizer.ts`, adjust parsing, record redacted capture, regression fixture, E4 only") remains outstanding for qualified M2. The two must be reported separately — the verification report must not promote a serializer fix to a full W-12 qualification.

---

## 3. B-W14-1 final status and rationale — PARTIALLY SATISFIED (pending pin-provenance verification)

### 3.1 Verdict

**B-W14-1 is PARTIALLY SATISFIED — correction reported merged, W-14 execution path not yet proven to consume it in this repo.**

- **What is satisfied:** The *implementation existence* of the numeric serialization correction is credibly reported via this task's IPD PR #176 merge assertion plus the previously independent root-cause diagnosis (string `"2885"` → 400 `DH-905` vs number `2885` → 200). That resolves the *technical blocker in principle* — IPD has a fix for `POST /v2/marketfeed/quote`.

- **What keeps it partial:** The *consumption* of that fix by W-14's execution path in IRR is **not established** by any artifact in this checkout:
  1. No IPD merge SHA is on the record to compare against `1ce6a829…`.
  2. No file/blob SHA for `buildQuoteRequestBody` proves numbers in IPD `main`.
  3. No IRR pin update from `1ce6a829…` to the alleged PR #176 merge SHA exists on this branch (or on `origin/main` `22a68a4` — also `1ce6a829…`).
  4. The Reliance HTTP 200 has not been tied by evidence to the daemon's builder.

Under the evidence standard in roadmap §9 (G-M2: **E4 only**), a reported merge without a pin-advancement and without a redacted body demonstrating `{"NSE_EQ":[2885]}` is insufficient to mark a live-path blocker as fully satisfied.

### 3.2 What would move it to SATISFIED

Publish (preferably from IPD, mirrored in IRR):

- IPD PR #176 merge commit SHA + IPD `main` at that SHA
- `buildQuoteRequestBody` file + blob SHA with numeric array
- Separate statement on historical builder (fixed or N/A with reason)
- Test file requiring `typeof parsed.NSE_EQ[0] === 'number'`
- Redacted Reliance transcript whose body is the builder's output → 200
- IRR pin advance `1ce6a829… → <PR#176 merge SHA>` with `.ci/verify-ipd-pins.mjs` + `frontend/package-lock.json` updates and CI green

### 3.3 What would move it to OUTSTANDING

Any of: PR #176 not on IPD `main` (candidate-only), builder still string-typed on `main`, historical builder independently string-typed and quoted separately, or Reliance 200 proven only via Python literal not the daemon. In that case W-14 remains 400-gated.

### 3.4 Impact on prerequisites (from W-14 investigation §8 / reconciliation §4)

- **Before this verification:** `B-W14-1` = mandatory, blocks every W-14 probe.
- **After this verification:** `B-W14-1` = **partially satisfied** — the fix exists in IPD's report, but IRR must still advance its IPD pin to consume it and publish the body-type evidence. The W-14 investigation's single recommended action ("land `buildQuoteRequestBody` number fix + 97-request E4 window") is now **narrowed to one remaining step in IRR**: pin advance + body-type proof. No new IPD code change is assumed; only publication and consumption verification remain.

---

## 4. Reconciliation publication verification — COMMIT `413d1b4` and PR #626

All checks passed against remote (exact `sha`/`jq` outputs captured 2026-11-23T15:39Z):

| Item | Verdict | Evidence |
|---|---|---|
| **Commit `413d1b4` exists on `arena/f18beaf5-iips-review-recovered`** | **PASS** | `gh api repos/ramkivs/iips-review-recovered/commits/413d1b4` → `sha:413d1b4b6881885f60986341ab1cd732a4f45031`, parent `6f3e9a2c025a74da3db772…`, message `W-14 reconciliation — W-06 mechanism vs measurement…` |
| **`DHAN-W14-RECONCILIATION-W06-2026-11-23.md` present in that commit** | **PASS** | `commits/413d1b4 → files[0] = docs/integration/DHAN-W14-RECONCILIATION-W06-2026-11-23.md` (149 insertions); `contents/…?ref=413d1b4` → `sha:785e95dda2ebd0712705796296411e625ac6cead`, size 19860 |
| **Original investigation at `6f3e9a2` unchanged** | **PASS** | `contents/DHAN-W14-INVESTIGATION-2026-11-23.md?ref=6f3e9a2` SHA `4a71fbd11e9f53fd4f36aaf245a6a914c682ad2f` (41055 bytes) == `contents/…?ref=413d1b4` same SHA/size; `commits/6f3e9a2 → files[0] = DHAN-W14-INVESTIGATION-2026-11-23.md`, preserved as addendum |
| **PR #626 contains the reconciliation commit** | **PASS** | `gh pr view 626 → { number:626, state:OPEN, title:"W-31 — Watchlists: sourced price display", headRefName:"arena/f18beaf5-iips-review-recovered", headRefOid:"413d1b4b6881885f…", baseRefName:"main", url:"https://github.com/ramkivs/iips-review-recovered/pull/626" }` |
| **Branch HEAD is `413d1b4`** | **PASS** | `git/refs/heads/arena/f18beaf5-iips-review-recovered → sha:413d1b4…` |
| **Remote branch base provenance** | **PASS** | Branch base `b7927de65e55fab9519eecebd1c4cb0a73717bd6` (merge PR #623 `docs(IID Stage 6)`); `origin/main` at reconciliation `22a68a4` merges PR #624 `774df7b` (W06 snapshot-to-live) + PR #625 `3f3d61a` (W-29) — exactly as footer states |
| **Footer accuracy** | **PASS with one annotation** | Footer correctly states `HEAD 6f3e9a2 (this branch, base b7927de), origin/main 22a68a4 (includes 774df7b)` — at write time `413d1b4`'s HEAD *was* `6f3e9a2` as parent; current HEAD is `413d1b4` with no `main` change. The only imprecision is that the branch title (`W-31`) reflects the branch's origin, not this doc's W-14 scope — harmless, but worth noting for PR hygiene. |

No evidence of merge, rebase, cherry-pick, or force-push to `main` in this verification window. Reconciliation is published exactly as tasked (§5, point 6: separate doc, history preserved).

---

## 5. Updated W-14 dependency and readiness — with verified W-12 (partial) result

| Dependency / prerequisite | Updated status after this pass | Remaining work (owner + artifact) |
|---|---|---|
| **W-06 progression** | **SATISFIED** — roadmap header `W-06 COMPLETE — OWNER ATTESTED at IPD 617fab0` governs; Snapshot-to-Live W06 is correctly recorded as `PARTIAL (mechanism only), NOT COMPLETE/NOT ACCEPTED` (reconciliation §3). No contradiction; two W-06s kept distinct. | None for W-14. |
| **W-12 serialization prerequisite (B-W14-1)** | **PARTIALLY SATISFIED** (see §3). IPD fix reported; IRR consumption unproven. | IPD: publish merge SHA + file/blob SHAs + test + Reliance transcript tying body to builder. IRR: advance `frontend/package.json` pin `1ce6a829… → <PR#176 merge SHA>`, run `.ci/verify-ipd-pins.mjs` + CI green. |
| **W-12 wire qualification (full)** | **OUTSTANDING** — distinct from serialization. Roadmap `W-12` requires one real `/marketfeed/quote` capture compared against `dhan_dto.ts`/`dhan_normalizer.ts` (field names, `last_trade_time` format, `net_change`, `ohlc.close`, depth, `volume`) with normalization adjustment + regression fixture + E4 re-run. M2 exit §10.3 needs it. | IPD: redacted capture vs DTO/normalizer diff + fixture; IRR: value cross-check procedure for M2 (not required to authorize W-14, but must not be conflated with B-W14-1 closure). |
| **W-27 sample relevance** | **UNCHANGED — not a start blocker** | 96-row P7 sample sufficient; ~4584 W-27 new rows stay `PROPOSED` until W-14 qualifies the owner-scoped subset (portfolio relevance criterion). `W-27` for new rows remains as Appendix A states. |
| **Baseline + IPD pin provenance** | **CLARIFIED, NOT SATISFIED** — current IRR pin `1ce6a829…` is still W-07…W-10 (not the PR #176 line). The W-14 execution baseline must be an IPD `main` commit at or after PR #176 merge, recorded as file SHAs (`dhan_api_client.ts`/`dhanApiClient`/`buildQuoteRequestBody`, DTO, normalizer, manifest path) + IRR commit (`413d1b4` or later). | Operator/IPD: state baseline (e.g. `1ce6a829…` only if it already contains PR #176, else `<PR#176 merge SHA>`). Record in authorization. |
| **Credential + `liveResolutionSupported`** | **ATTESTED for W-06, re-verify for W-14** | Operator: re-confirm `liveResolutionSupported:true`, `vendorEgress=IPD_SERVER_HTTPS`, DPAPI carriers + DACL + re-read triggers prior to E4 window. No rotation assumed. |
| **Rate-limit / entitlement / concurrency** | **Unchanged — must be stated in authorization** | IPD: confirm 60/min token-bucket, concurrency 8, bounded retry-transient-only still enforced; operator: confirm Dhan Data-API entitlement (roadmap §10 concern, not the 400). |
| **Request budget + reviewer + window** | **Proposal unchanged, not yet authorized** | Owner: explicit grant for 96 + 1 + optional W-27 subset (separate grant), off-hours allowance (IST 09:15–15:30 session note), disclosure reviewer (zero-secret grep over daemon stdout/stderr, IRR logs, bodies — D-7 `MUST NOT` paths/secretRefPointers removed by W-03). |
| **Redacted evidence + zero-secret grep** | **Still mandatory per-probe** | For each `(exchangeSegment, dhanSecurityId)`: redacted vendor request body (numbers, segment) + redacted vendor response (non-secret fields: `ltp`, `previousClose`, `last_trade_time`, `securityId` echo if present, `status`/`asOf`/`ageSeconds`) + daemon `MarketQuoteEnvelope` mapped to `companyId|exchangeSegment|ISIN:isin:series` + independent value/cross-check (tick tolerance, session `GOOD/STALE/UNAVAILABLE` noted) + `UNRESOLVED_INSTRUMENT` not silently swallowed. D-7 `MUST NOT` grepped. |
| **Stale-ID outcome classification** | **Still mandatory taxonomy** | One-paragraph signature: `UNRESOLVED_INSTRUMENT` (mapping layer, no vendor call) vs `HTTP_ERROR 400/DH-905` (type error) vs `404/UNKNOWN_INSTRUMENT` (stale id) vs obvious `securityId` mismatch (vendor returns different instrument) — per wrong-id probe. |

**Technical readiness:** W-14 is **technically ready to execute once the pin-advance verification is recorded** — no new code change is assumed beyond that consumption step. The only remaining *technical* gate before the E4 burst is proving that `1ce6a829…` successor contains the numeric builder for the exact path W-14 will call.

**Execution authorization:** Not granted — it is a separate, explicit owner grant (sample, budget 97, baseline, window, reviewer). The report must not conflate the two; readiness ≠ authorization.

---

## 6. 97-request E4 proposal — CONFIRMED with one annotation

**Proposal at `6f3e9a2` / `413d1b4` §9 Step 2 / §10.3:** Bounded E4 burst of **96-row P7 sample (NSE:EQ 48, BSE:A 47, BSE:B 1) + 1 wrong-ID control = 97 `POST /v2/marketfeed/quote` calls**, each with redacted request + daemon envelope + independent cross-check + zero-secret grep; stale-ID taxonomy; disposition-only manifest promotion (`PROPOSED→QUALIFIED` / `WITHHELD` with `STALE_DHAN_ID`/`VENDOR_MISMATCH`/`INSUFFICIENT_EVIDENCE`); sanitized per-row table (no raw ISIN) + daemon `qualifiedMappings` delta.

**Confirmation:** **Valid — and still the right next E4 window.** Scope matches roadmap `W-14` ("96 existing rows, sampled across NSE and BSE, plus every W-27 row that matters") without inventing a count, covers both exchange/segment types and both BSE series, and uses the exact `ISIN:isin:series` binding W-28 enforces. The wrong-ID probe is mandatory for stale-id signature; the budget is bounded and rate-limit-compliant.

**One annotation:** The 97 counts only the *quote* serialization path. If IPD's historical builder is a distinct code path, its verification needs a clearly separated historical request (W-12 vs W-14) — do not fold historical `POST /v2/marketfeed/history` calls into the 97 without a separate budget line and justification. Report them separately.

**Exact baseline + sample definition required before authorization:**

- `IPD baseline commit SHA` (must be on IPD `main`, at or after PR #176 merge; record `dhan_api_client.ts` blob SHA + historical builder disposition + test file blob SHA + CI run ID)
- `IRR commit SHA` presenting evidence (at least `413d1b4`; ideally the pin-advance commit after it)
- Qualification sample table (96 rows with `companyId|exchangeSegment|ISIN:isin:series|dhanSecurityId` — raw ISIN not published, masked as `INE***018` per W-28 privacy model; coverage explicitly `NSE:EQ 48, BSE:A 47, BSE:B 1`) + wrong-ID probe definition (off-by-one `dhanSecurityId` in same segment, expected outcome `UNRESOLVED_INSTRUMENT` or obvious mismatch, never silent wrong price)
- Rate-limit/budget/window/reviewer statement

---

## 7. Branch integration recommendation

The reconciliation (§5) listed four options; with publication verified at `413d1b4`, the assessment is:

| Option | Verdict now | Rationale |
|---|---|---|
| **A. Publish from existing PR #626** | **Done — correct for the reconciliation phase** | Achieved the tasking precisely: no merge/history-rewrite, original `6f3e9a2` preserved, reconciliation at `413d1b4` on same PR with proof (see §4). Maintains the reviewable evidence chain for PR #626 without risk. |
| **B. Cherry-pick `774df7b` content onto `arena/f18beaf5-iips-review-recovered`** | **Not recommended now; available on explicit request** | Would duplicate `W06-SNAPSHOT-TO-LIVE…` + `dhanRevisionCoverage.*` + tracker §16.321 onto this branch for a single-branch view. Unnecessary because `origin/main` `22a68a4` already contains that content via merge `774df7b + 3f3d61a`; reviewers can read both refs. Cherry-picking now would create a second source-of-truth for W-06 without closing the pin-verification gap. |
| **C. New W-14 execution branch from `origin/main` `22a68a4`** | **Recommended for the next W-14 work** | Once `B-W14-1` consumption is proven (pin advance + body-type test), the E4 evidence and any promotion logic should live on a fresh branch from current `main` (which already has W-06 + W-29). This keeps the investigation/reconciliation as historical record and gives execution its own reviewable baseline. Do not reuse the `f18beaf5` branch for live-vendor traffic without an explicit rename/rebase. |
| **D. Merge unrelated histories** | **Not recommended** | `git merge origin/main` still reports `refusing to merge unrelated histories` without `--allow-unrelated-histories`; using that flag would rewrite the divergence narrative for no evidence gain and complicate PR #626 history. Only if a maintainer explicitly directs it. |

**Recommended maintainer decisions:**

1. Keep PR #626 OPEN as the reconciliation vehicle (do not close it for title reasons — `W-31` title reflects branch origin, not scope; add a PR comment clarifying `6f3e9a2` + `413d1b4` are W-14).  
2. Do **not** cherry-pick or merge histories at this stage.  
3. Open the next branch from `22a68a4` *after* IPD publishes the PR #176 merge SHA and IRR publishes the pin-advance commit — that branch then carries the authorization and the 97-request evidence.

---

## 8. Remaining owner decisions and next action (single most appropriate action in the W-14 sequence)

### Owner decisions — none required on W-14 scope; authorization required on execution

- No new owner decision is required to authorize W-14's *scope* (roadmap v1.1 §6 governs it: live mapping correctness for existing + W-27-added rows that matter + stale-id signature).  
- **Execution authorization is required** before any vendor call: IPD baseline SHA (at/after PR #176), 96+1 sample, optional W-27 subset as separate grant, request budget, off-market window (including IST session note), and disclosure reviewer per D-7 `MUST NOT` / W-03.

### Next action

**Authorize a single IRR maintainer action: advance the IPD pin from `1ce6a829…` to the verified PR #176 merge SHA and publish the numeric body-type proof — without executing W-14's 97-request E4 burst.**

Concretely:

1. IPD maintainer publishes: PR #176 merge commit SHA on `main`, `buildQuoteRequestBody` + historical-builder file/blob SHAs, test asserting numbers, and the redacted Reliance transcript tying the 200 to the builder's output.  
2. IRR maintainer on a new branch from `22a68a4` updates `frontend/package.json` + `frontend/package-lock.json` + `.ci/verify-ipd-pins.mjs` to that SHA, proves `.ci/verify-ipd-pins.mjs` pass + CI green, and records the baseline/sample definition (§6) for W-14 authorization.  
3. **Do not run the 97-request E4 until step 2 is merged** — that keeps readiness and authorization distinct and closes `B-W14-1` from `PARTIALLY SATISFIED` to `SATISFIED` on E4 evidence, not on an assumption.

This preserves the reconciliation's "no execution yet" charter, establishes the accurate W-14 readiness position from merged implementation evidence (not from a carried-forward blocker label), and makes the subsequent E4 window a bounded, reviewable operation.

---

**Repository state at publish:** `HEAD` `413d1b4b6881885f60986341ab1cd732a4f45031` on `arena/f18beaf5-iips-review-recovered` (parent `6f3e9a2`, base `b7927de`, `origin/main` `22a68a4` with PR #624 `774df7b` + PR #625 `3f3d61a`); `frontend/package.json` pin `1ce6a829a7ce65550356a0071c108a60f2d813be` (W-07…W-10); IPD `main` not independently read back from this sandbox (403) — PR #176 merge SHA and implementation files are reported, not verified here; no merge, rebase, or history rewrite performed; no vendor call executed; PR #626 OPEN (`headRefOid` `413d1b4`).  
**Artifacts cited:** `DHAN-W14-INVESTIGATION-2026-11-23.md` (`4a71fbd…` @ `6f3e9a2` / `413d1b4`, 41055 bytes), `DHAN-W14-RECONCILIATION-W06-2026-11-23.md` (`785e95d…` @ `413d1b4`, 19860 bytes), `DHAN-QUOTE-API-FAILURE-ROOT-CAUSE-2026-11-18.md`, roadmap `DHAN-LIVE-INTEGRATION-IMPLEMENTATION-ROADMAP-2026-11-11.md` v1.1 (§6 W-14, §10.3 M2, §9 G-M2), `W06-SNAPSHOT-TO-LIVE-QUOTE-FRESHNESS-COVERAGE-2026-11-23.md` (blob `8f77f90` @ `774df7b`/`22a68a4`), `W14-W12-…` (this document), `frontend/server/market-data/dhanMarketDataTransport.ts`, `.ci/verify-ipd-pins.mjs`, `iips-production-market-data#1ce6a829…` / `a624d06` / `617fab0` / `af4460ee` / `bcfa6cb…`, IPD PR #156/#164/#166/#167/#168/#176, PR #624 `774df7b` / #625 `22a68a4` / #626 `413d1b4`, commits `b7927de`/`6f3e9a2`/`413d1b4`/`22a68a4`.  
**Evidence classes:** W-12 serialization fix = **E4 reported** (IPD PR #176, blocked from independent read-back here); W-12 wire qualification = **E4 outstanding**; W-14 mapping correctness = **E4 outstanding**; reconciliation/wiring = **E1/E2 synthetic + E3 operational (PR/CI states)**.

---

## 9. Post-PR #627 reconciliation (2026-11-23)

This addendum re-evaluates §2.2 against `main` @ `8f89311273afc9c488db1144aed5112511613a53` (PR #627 merged 2026-11-23T17:25:21Z). The original verification above is preserved as the pre-merge record.

### 9.1 Checklist re-evaluated

| Check | Pre-#627 result in §2.2 | Reconciled result |
|---|---|---|
| **1. PR #176 merged into IPD main** | Reported, not independently verified | **Verified.** PR #627 records the merge and advances the IRR pin to the PR #176 merge commit `2685562522f1a2fd1d745a7857f771bf21453315`. |
| **2. `buildQuoteRequestBody` serializes as numbers** | Reported; not inspectable in the checkout | **Verified at the pinned IPD version.** IPD PR #176 emits `{"NSE_EQ":[2885]}`; IRR's `dhanIdentityJoined.test.tsx` asserts the numeric body. |
| **3. W-14 quote path uses the corrected implementation** | Expected, dependent on pin provenance | **Satisfied.** IRR `main` @ `8f893112` pins `26855625…`; W-29's boundary and the Dhan market-data route consume that pinned builder. |
| **4. Separate serializer still emits strings** | Two paths must be checked separately | **Historical builder verified unchanged:** `buildDhanHistoricalRequestBody` still emits `securityId` as a JSON string. This is a W-12 / D-4.6 historical gate, not a W-14 quote-path blocker. |
| **5. Tests verify numeric JSON, not string** | Not verified | **Verified.** IPD CI at `26855625…` is green and IRR's package-consumer / joined tests pin the numeric wire form. |
| **6. Reliance 200 evidence exercises the same builder** | Not verified — chain-of-custody gap | **Partially closed.** PR #627 records an operator-reported Reliance HTTP 200 on `26855625…`; the evidence is tied to the pinned IPD main, but the historical live contract remains unproven (W-12 scope). |

### 9.2 Reconciled readiness and next action

- **B-W14-1: SATISFIED.** The pin advance is merged, not merely prepared on a branch. The quote serialization defect (G-3) and the pin divergence (G-6) are closed for the W-14 quote path.
- **W-14 technical readiness: achieved.** No code change is required before the E4 run.
- **Remaining gate: execution authorization (B-W14-2 / B-W14-3).** The 97-request E4 burst must still be explicitly authorized with the sample table, request budget, off-market window, and disclosure reviewer.
- **W-12 historical verification remains open** and is intentionally not folded into W-14. D-4.6/D-4.7 keep `W-20` behind a separate historical `E4` schema qualification.

The "next action" in §8 is therefore superseded: the pin advance has been merged; the next action is the bounded, authorized 97-request W-14 E4 run, not another pin advance.
