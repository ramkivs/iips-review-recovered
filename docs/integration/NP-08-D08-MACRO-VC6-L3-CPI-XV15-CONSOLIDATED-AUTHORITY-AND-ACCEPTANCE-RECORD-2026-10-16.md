# NP-08 / D08 MACRO — V-C6 · L-3 · CPI MISSING-INDEX · XV-15 · CONSOLIDATED AUTHORITY, ACCEPTANCE & EXECUTION HANDOFF RECORD

> **Record ID:** `NP-08-D08-MACRO-VC6-L3-CPI-XV15-CONSOLIDATED-RECORD-01`
> **Date:** `2026-10-16` (Asia/Calcutta)
> **Workstream:** NP-08 — Intelligence · **D08 Macro**
> **Program Authority (PA):** **Ramki** — single owner, sole user, and Program Authority. All four decisions (`D-A`, `D-B`, `D-C`, `D-D`) recorded in §2 were explicitly supplied by the Program Authority at the Phase 2 Decision Gate on `2026-10-16`.
> **Recording agent:** Arena Agent Mode — investigation, bounded implementation, validation, and record preparation only.
> **IRR Baseline (`origin/main`):** `6edc966420c90704b7afca144b70532f836d31b8` (PR #111 merged; `V-C5` CLOSED)
> **IPD Baseline (`origin/main`):** `4d3e1cdca3a33da0ec3be8b336b17128108a502c` (IPD PR #7 head `6e3cfcf21c8f4a6925df5a3a7b21838723367799`)

---

## 1. Verified Starting State (Phase 1)

| Repository / Item | Verified Pre-Execution State |
|---|---|
| **IRR (`ramkivs/iips-review-recovered`)** | `refs/heads/main` = `6edc966420c90704b7afca144b70532f836d31b8` (local `HEAD` = `origin/main` = GitHub API `main`); working tree clean; `0` open PRs; `V-C5` **CLOSED** (`VC-1`, `VC-2`, `VC-3` durably evidenced in `§16.34`). |
| **IPD (`ramkivs/iips-production-market-data`)** | `refs/heads/main` = `4d3e1cdca3a33da0ec3be8b336b17128108a502c`; **PR #7** (`XV-15: classify macro vintage source as derived`, branch `fix/xv-15-derived-macro-vintage-classification`, head `6e3cfcf21c8f4a6925df5a3a7b21838723367799`) is `OPEN`, `MERGEABLE`, `CLEAN`, touching `1` file (`src/ui/view_models/ui13_macro_vintage_tracker.ts`, `+1/-1`, blob `5d16773f074e83a14ada10ea2089589a7f202b01`). |

---

## 2. Explicit Program Authority Decisions (Phase 2 Decision Gate)

All four decisions were supplied explicitly by **Ramki (Program Authority)** at the Phase 2 Decision Gate on `2026-10-16` (`ask_user` decision gate):

| Decision ID | Scope | PA Selection | Operative Effect |
|---|---|---|---|
| **`D-A` — IPD PR #7 (`XV-15`)** | `ramkivs/iips-production-market-data` PR #7 (`fix/xv-15-derived-macro-vintage-classification` @ `6e3cfcf21c8f4a6925df5a3a7b21838723367799` → `refs/heads/main`): 1-line classification correction in `src/ui/view_models/ui13_macro_vintage_tracker.ts` (`'REAL'` → `'DERIVED'`) | **`authorize_merge_ipd_pr7`** — **AUTHORIZED** | Explicit authority granted to merge IPD PR #7 in Phase 6 after all pre-merge phases complete, and to reconcile `XV-15` in the IRR master tracker using the verified IPD merge coordinates. |
| **`D-B` — `V-C6` & `L-3` Implementation and Merge Authority** | 1. Update `frontend/src/api/macro.ts` to parse and surface JSON error fields (`code`, `message`, `dataset`) for non-2xx responses while preserving the `macro transport returned <status>` prefix.<br>2. Pass environment/dependency-backed `MospiSourceConfig` into `handleMacroRequest(req, res, deps)` from `frontend/server/executive-transport.ts`.<br>3. Add the `L-3` server-side test proving `/api/macro` responses are invariant to UI12 settings (`['theme']`). | **`authorize_vc6_l3_and_merge`** — **AUTHORIZED (Implementation + Phase 6 Merge once validated and CI-green)** | Bounded implementation authority granted for the two `V-C6` residuals and the `L-3` settings-invariance test, plus explicit merge authorization for the resulting IRR PR in Phase 6 once validated, CI-green, and updated with the verified IPD PR #7 merge coordinates. |
| **`D-C` — CPI Missing-`index` Disposition (`§16.29.7`)** | Disposition of the `996 / 25,884` live CPI records carrying no `index` value in the upstream MoSPI payload | **`option_a_accept_close`** — **Option (a): Accept as upstream MoSPI characteristic & close tracker item** | Accepted as an upstream MoSPI payload characteristic; existing `'—'` rendering in `MacroResearch.tsx` (`CpiRecord.index?: string`) is recorded as sufficient under `DT-8`; tracker item **CLOSED** with zero code changes and no external MoSPI contact. |
| **`D-D` — Governance Boundaries** | Attribution (`DT-11`), licensing/commercial use/redistribution/caching/retention, GODL, `DT-13`, `M-3`, MoSPI external contact, general `XV-16` cross-corpus rule, and optional browser live-source E2E | **`retain_boundaries`** — **Retain all existing unresolved/non-production governance states** | Existing states retained unchanged: Entitlement = `B — PARTIALLY ESTABLISHED`; `DT-11` formal attribution, commercial use, redistribution, caching, retention, Copyright Policy & ToU = `NOT DETERMINED`; GODL, `DT-13`, `M-3` = `NOT ESTABLISHED`; MoSPI contact = `NOT AUTHORIZED`; general `XV-16` rule = `UNRESOLVED` by design (`D-2` narrow ruling remains effective); browser live-source E2E remains optional/non-blocking per `§16.31.6`; production = `NOT AUTHORIZED`. |

---

## 3. Implementation & Validation Summary (Phases 3–4)

### 3.1 Changes Implemented on IRR (`ramkivs/iips-review-recovered`)

| File | Change | Requirement Covered |
|---|---|---|
| `frontend/src/api/macro.ts` | Added `MacroErrorPayload` and `MacroTransportError` (`status`, `code`, `errorMessage`, `dataset`); updated `getJson` to parse JSON error bodies on non-2xx responses while preserving the `macro transport returned <status>` prefix and falling back cleanly when a body is empty or non-JSON. | `V-C6` residual (a) |
| `frontend/src/api/macro.test.ts` *(new)* | 4 focused unit tests covering 502 `code`/`message`/`dataset` surfacing (`INDICATOR_NOT_GOVERNED` vs `RETRY_BUDGET_EXHAUSTED`), 400 validation message surfacing, and exact `macro transport returned <status>` prefix preservation on empty/non-JSON bodies. | `V-C6` residual (a) validation |
| `frontend/server/macro/macro-transport.ts` | Exported `MacroRouteDeps` and added `resolveMacroSourceConfigFromEnv(env)` reading optional `MOSPI_BASE_URL`, `MOSPI_TIMEOUT_MS`, `MOSPI_MAX_RETRIES`, `MOSPI_PAGE_SIZE` (returning `{}` when unset so governed defaults in `mospi-source.ts` remain untouched). | `V-C6` residual (b) |
| `frontend/server/executive-transport.ts` | Added `setMacroRouteDeps` and wired `deps` (`resolveMacroSourceConfigFromEnv()` merged with optional `macroRouteDepsOverride`) into `macro.handleMacroRequest(req, res, deps)` at the `/api/macro/` mount (`:752`). | `V-C6` residual (b) |
| `frontend/server/macro/macro-transport.test.ts` | Added 3 `V-C6` configuration & mount-wiring tests (env parsing, `handleMacroRequest` forwarding, and live `executive-transport` `server` mount dispatch via `setMacroRouteDeps`) and 1 `L-3` server-side UI12 settings-invariance test proving `/api/macro/{nas,cpi,iip}` 200 and 502 responses are byte-identical across `theme: 'light'` (default), `theme: 'dark'` (`updateSettings`), and `resetSettings`, while `validatePreferencesPatch` rejects `defaultDataMode`/`pitMode`. | `V-C6` residual (b) + `L-3` validation |
| `frontend/src/features/research/MacroResearch.test.tsx` | Added 1 mounted-view test verifying that a 502 response with `{ code: 'RETRY_BUDGET_EXHAUSTED', message: 'upstream unreachable', dataset: 'NAS' }` renders `macro transport returned 502` together with `RETRY_BUDGET_EXHAUSTED` and `upstream unreachable` on `/research/macro`. | `V-C6` UI regression & integration |

### 3.2 Executed Validation Evidence (V62–V64)

| Verification ID | Check | Result |
|---|---|---|
| **V62** | Focused Macro test suites (`src/api/macro.test.ts`, `server/macro/macro-transport.test.ts`, `src/features/research/MacroResearch.test.tsx`, `src/features/research/MacroContext.test.tsx`) | **PASS** — `4` files / `49` tests passed (`0` failed): `macro.test.ts` `4/4`, `macro-transport.test.ts` `23/23`, `MacroResearch.test.tsx` `16/16`, `MacroContext.test.tsx` `6/6`. |
| **V63** | Full IRR validation pipeline (`npm run typecheck`, `npm run test:ci`, `node .ci/assert-tests.js .vitest-report.json`, `npm run build`) | **PASS** — `tsc --noEmit` exit `0`; `vitest run` **`69` test files / `770` tests passed / `0` failed**; `assert-tests` `OK — 69 test file(s), 770 test(s), 0 failed`; `npm run build` (`tsc -b && vite build`) exit `0` (`90` modules, `265.52 kB`, gzip `77.03 kB`). |
| **V64** | Scope, fence, and governed-act integrity check | **PASS** — Only the 6 code/test files above, this record, and the master tracker changed. Fence blobs (`reports-transport.ts` `98147054…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`) and all prior `NP-08`/`D08`/`D89`/`D91` governed acts are byte-identical to `main`. |

### 3.3 Item-by-Item Acceptance & Disposition Matrix

| Item | Acceptance Criteria | Validation & Authority Basis | Disposition |
|---|---|---|---|
| **`V-C6` — API client & configuration residuals** | (1) `src/api/macro.ts` parses and surfaces `code`, `message`, `dataset` on non-2xx responses while preserving `macro transport returned <status>`; (2) `executive-transport.ts` passes env/dependency-backed `MospiSourceConfig` `deps` into `handleMacroRequest`; (3) Route/view/nav portion already accepted in PR #103/#104. | `D-B` authority; V62–V64 (`macro.test.ts` 4/4, `macro-transport.test.ts` 23/23, `MacroResearch.test.tsx` 16/16, full suite 69/770). | **ACCEPTED / CLOSED** *(effective on durable `main` publication)* |
| **`L-3` — UI12 settings-invariance test** | Server-side test proving `/api/macro` responses are invariant to UI12 settings using the established `['theme']` settings key (`NP-11-D4`). | `D-B` authority (and Packet `§6.4(iii)`); `macro-transport.test.ts` `L-3` suite green across `light` → `dark` → `reset` and 200/502 paths. | **ACCEPTED / CLOSED** *(effective on durable `main` publication)* |
| **CPI missing-`index` observation (`§16.29.7`)** | Explicit PA choice among `§16.29.7` Options (a), (b), (c). | `D-C` Option (a) selected by PA: upstream MoSPI characteristic; existing `'—'` rendering in `MacroResearch.tsx` sufficient under `DT-8`. | **CLOSED (Accepted as upstream provider characteristic)** |
| **`XV-15` — IPD PR #7 (`ui13_macro_vintage_tracker.ts`)** | Explicit PA merge authorization (`D-A`), merge of IPD PR #7 (`'REAL'` → `'DERIVED'`) to IPD `main`, remote verification of IPD `main` commit/blob, and tracker reconciliation in IRR. | `D-A` granted; IPD PR #7 (`6e3cfcf21c8f4a6925df5a3a7b21838723367799`) validated and `MERGEABLE`/`CLEAN`. In Phase 6 Step 1, `gh pr merge 7 --repo ramkivs/iips-production-market-data --merge` returned `Message: Resource not accessible by integration, Locations: [{Line:1 Column:58}]` (exit `1`) because the Arena GitHub App integration token is scoped to the primary session repository (`ramkivs/iips-review-recovered`) and cannot execute `mergePullRequest` on the external IPD repository. | **AUTHORIZED (`D-A`) & VALIDATED — PENDING PA/OPERATOR MERGE ON IPD (`PR #7` `OPEN`/`MERGEABLE` @ `6e3cfcf21c8f4a6925df5a3a7b21838723367799`; IPD `main` verified unchanged @ `4d3e1cdca3a33da0ec3be8b336b17128108a502c`)** |
| **`D-D` — Governance boundaries & `/research/macro` browser E2E** | Retain unresolved/non-production states without inferring rights or external contact permission; browser live-source E2E remains optional/non-blocking per `§16.31.6`. | `D-D` confirmed by PA. | **BOUNDARIES RETAINED AS RECORDED (Unresolved items remain unresolved by design)** |

---

## 4. Phase 5 — Durable Pre-Merge Execution Handoff

This section records the exact pre-merge state, dependency order, and remaining merge/verification steps so that if any merge terminates the session, a subsequent session can resume **only the outstanding post-merge verification** without repeating implementation, recreating PRs, or re-running completed work.

### 4.1 PR Inventory & Merge Order

| Merge Order | Repository | PR | Branch & Head Commit | Authorization | Required Pre-Merge Checks | Exact Merge Command |
|---:|---|---|---|---|---|---|
| **1 (First)** | `ramkivs/iips-production-market-data` (IPD) | **PR #7** (`https://github.com/ramkivs/iips-production-market-data/pull/7`) | `fix/xv-15-derived-macro-vintage-classification` @ `6e3cfcf21c8f4a6925df5a3a7b21838723367799` → `refs/heads/main` (`4d3e1cdca3a33da0ec3be8b336b17128108a502c`) | **`D-A`** (`authorize_merge_ipd_pr7`, explicit PA decision `2026-10-16`) | `OPEN`, `MERGEABLE`, `CLEAN`, 1-file `+1/-1` diff verified (`src/ui/view_models/ui13_macro_vintage_tracker.ts`, blob `5d16773f074e83a14ada10ea2089589a7f202b01`). | `gh pr merge 7 --repo ramkivs/iips-production-market-data --merge` |
| **2 (Second)** | `ramkivs/iips-review-recovered` (IRR) | **IRR PR** from `arena/597ad189-iips-review-recovered` | `arena/597ad189-iips-review-recovered` → `refs/heads/main` (`6edc966420c90704b7afca144b70532f836d31b8`) | **`D-B`, `D-C`, `D-D`** (`authorize_vc6_l3_and_merge`, `option_a_accept_close`, `retain_boundaries`, explicit PA decisions `2026-10-16`) | 1. Local V62–V64 green (`69` files / `770` tests, `tsc` `0`, `build` `0`).<br>2. IPD PR #7 merged first and its actual merge commit SHA recorded in `§5` below and in tracker `§16.6 XV-15` / `§16.35`.<br>3. Hosted GitHub Actions `Typecheck · Test · Build` check `pass` on the final IRR PR head commit. | `gh pr merge <IRR_PR_NUMBER> --repo ramkivs/iips-review-recovered --merge` |

### 4.2 Post-Merge Verification Checklist (Phase 7 Resume Protocol)

If the active session terminates upon executing a merge in Phase 6, a resuming session **MUST NOT** re-implement code, recreate PRs, or repeat a completed merge. Instead, run only the remaining checks below:

1. **Verify IPD `main` (`ramkivs/iips-production-market-data`):**
   - `gh pr view 7 --repo ramkivs/iips-production-market-data --json state,mergedAt,mergeCommit`
   - `gh api repos/ramkivs/iips-production-market-data/commits/main --jq '{sha: .sha, tree: .commit.tree.sha, parents: [.parents[].sha]}'`
   - Confirm `src/ui/view_models/ui13_macro_vintage_tracker.ts` on IPD `main` has blob SHA `5d16773f074e83a14ada10ea2089589a7f202b01`.
2. **Verify IRR `main` (`ramkivs/iips-review-recovered`):**
   - `git fetch origin main && git rev-parse origin/main`
   - `gh pr list --repo ramkivs/iips-review-recovered --state merged --limit 3`
   - Confirm all 8 changed files of the IRR PR are present on `origin/main`, fence blobs (`98147054…`, `51704c12…`, `cb8db45d…`) are unchanged, and tracker `§16.35` records the verified IPD PR #7 merge coordinates.

---

## 5. Phase 6–7 Execution Coordinates (Verified)

| Coordinate | Value |
|---|---|
| **IPD PR #7 Merge Attempt (Phase 6 Step 1)** | Executed `gh pr merge 7 --repo ramkivs/iips-production-market-data --merge` under `D-A` authorization → **BLOCKED by Arena GitHub App integration boundary:** `Message: Resource not accessible by integration, Locations: [{Line:1 Column:58}]` (exit `1`). No workaround was improvised. |
| **Verified IPD `main` & PR #7 Coordinates (Phase 6 Step 2)** | IPD `refs/heads/main` verified unchanged at **`4d3e1cdca3a33da0ec3be8b336b17128108a502c`**; IPD **PR #7** (`https://github.com/ramkivs/iips-production-market-data/pull/7`) verified **`OPEN` / `MERGEABLE` / `CLEAN`** at head **`6e3cfcf21c8f4a6925df5a3a7b21838723367799`** (`src/ui/view_models/ui13_macro_vintage_tracker.ts` `+1/-1`, blob `5d16773f074e83a14ada10ea2089589a7f202b01`). Ready for direct PA merge in GitHub UI or operator CLI. |
| **IRR PR URL & Number** | **PR #112** — `https://github.com/ramkivs/iips-review-recovered/pull/112` (`arena/597ad189-iips-review-recovered` → `refs/heads/main`; initial head `1c208f3a6e1ccf2bc7f2050e2f021d0af2ceb5e3`, CI run `38791448451` / job `116616766333` `SUCCESS`). |
| **IRR `main` Merge Commit** | *Verified post-merge in Phase 7 (not self-embedded in the committed blob).* |
