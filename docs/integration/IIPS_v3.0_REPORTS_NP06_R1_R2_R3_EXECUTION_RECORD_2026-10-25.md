# IIPS v3.0 — NP-06 Reports: R1 / R2 / R3 Investigation and Execution Record

| Field | Value |
|---|---|
| **Record** | `IIPS-V3-REPORTS-NP06-R1-R2-R3-EXECUTION-2026-10-25-02` |
| **Authority** | [`IIPS_v3.0_REPORTS_NP06_RESUMPTION_COMMISSIONING_PA_DECISION_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_RESUMPTION_COMMISSIONING_PA_DECISION_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01`) §2(1)–(4). This record **executes** that act. It renders no further decision. |
| **Prepared decision input** | [`IIPS_v3.0_REPORTS_NP06_R1_R2_R3_PA_DECISION_REQUEST_2026-10-25.md`](IIPS_v3.0_REPORTS_NP06_R1_R2_R3_PA_DECISION_REQUEST_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-R1-R2-R3-PA-DECISION-REQUEST-2026-10-25-01`) — **PROPOSED — NOT APPROVED.** It is decision input, not authority. |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Repository** | IRR `ramkivs/iips-review-recovered` only, on the session branch. No other branch created or checked out. IPD was **read** through the GitHub API and **not written**. |
| **Baseline re-verified before execution** | IRR `origin/main` = local `HEAD` = `0e1b075d72e313e1950dd2f12aa8fbf066e0e1c1` (tree `9fd29c457796b27df770f2bbb9827f262cf80e1a`), merge of PR #255; **0** open IRR PRs; post-merge CI run `40177324528` `success` on `f0c14dcb…`. IPD `main` `4b5c65a731a66a6fa1260146a55df9ed772953a5`. |
| **Historical objects used as sources** | `39dd43ebbd54767c4258513a5dfc2d9c1b861d28` (tree `3fdc29d6…`) and tip `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b` (tree `0e253712…`), fetched as loose objects with `git fetch --depth=1 <sha>`. Nothing was merged, cherry-picked, rebased, or promoted from them. |

---

## 1. Starting-claim verification (executed, not carried)

| Claim | Method | Result |
|---|---|---|
| PRs #254 / #255 merged | `gh pr view` | **CONFIRMED** — merge commits `f0c14dcb…` / `0e1b075d…`, both `MERGED` |
| Post-merge CI green | `gh api .../actions/runs?head_sha=f0c14dcb…` | **CONFIRMED** — run `40177324528`, `CI`, `success` |
| Remote `main` = local base | `git fetch --prune`, `git merge-base HEAD origin/main` | **CONFIRMED** — `0e1b075d…` |
| Restored modules byte-identical | `git hash-object` vs `git rev-parse <sha>:<path>` | **CONFIRMED** — `f57fa6a6…`, `1da89bd4…`, `fc9a8fbb…` at `39dd43eb…`, at `6a8afbb2…`, and in the worktree |
| Canonical 46 / artifact 56 | `npx vitest run` (this pass) | **CONFIRMED** — 46 and 56 passed, 0 failed |
| Fence in force | blob hash | **CONFIRMED** — `981470541812a64c733309f1debec75455d85bee`, unchanged |
| Pin unchanged | `frontend/package.json` blob | **CONFIRMED** — `6274537a81e1496189e629c7e8f371f80144dfec`; `#2d9130e76bb0dc89daeefabaf297e27bdaa84250` |
| `R1` / `R2` / `R3` open, `F-7` unsatisfied, `CV-51` blocked | re-derived (below) | **CONFIRMED** — every status independently re-derived this pass |

---

## 2. `R1` — ownership source: **NOT ESTABLISHED** (unchanged)

The full sweep and its results are recorded in the decision request §2.2. In summary, this pass re-examined: every `D-2` §8 reference in the corpus; the Gate B request, investigation, and Option C decision; the effective F-3 mechanism, value act, and qualification records; `AD-20`; `CV-43`/D115; the NP-06 governance record at the qualified tip; and the current enforcement stack in code.

**Finding:** no approved instrument establishes a Reports ownership source for the current baseline. The only established Reports ownership contract (`R2`/`C4`, authenticated principal `(tenantId, userId)`) is unsatisfiable here because its entire enforcement stack — `SecuredExecutor`, `keycloakAdapter`, `admin-transport`, a production `TenantDirectory` — **does not exist on `main`** (removed program-wide 2026-10-12, PR #61; F-3 replacement scoped to NP-09/10/11 only).

**Consequence:** the ownership-source act named in commissioning §4 remains the sole blocker for `R1`, and `R2` cannot be decided before it. No owner, tenant, contract, or semantic rule was invented; the F-3 pair was not aliased. `D-1` options and a recommendation are prepared in the decision request §2.4–§2.5.

---

## 3. `R2` — contract and binding: **UNBOUND** (analysis complete)

The transport reconciliation is prepared in the decision request §3. Three findings are worth restating here because they are measurements, not options:

1. **The historical transport cannot be restored by copying.** Blob `cdee7ed16b461b058f6ed117c41380b497a6a9d6` imports three modules that do not exist on `main`. Restoring it would require restoring the retired authentication architecture — a program-wide reversal, not a Reports change.
2. **Two of the transport's security controls have no current-baseline equivalent** and are **not** implementation details: the `401` authentication boundary (no credential exists) and the role gate `viewer/analyst/admin` (no roles exist). Both are `D-2` decisions, not agent choices. A third — the governed audit primitive that emitted deny/allow records — also disappears with the executor.
3. **The contract-independent controls survive unchanged** (client-supplied identity/ownership → `400`; durable-identity fields → `400`; `companyId`/`runtimeCompanyId` always refused; server-side surface allowlist; `503 persistence-unavailable`). They are recorded as prepared but **deliberately not committed**: a transport that cannot establish an owner cannot reach them, so shipping them now would be dead code presented as progress.

The fifteen-case NP-06 §5.4 inventory is mapped to the current baseline in the decision request §3.4, with each row marked REUSE / RE-EXPRESS / RETIRE / BLOCKED. Row 15 (frozen engine unchanged) is **satisfied by measurement this pass**: `ReportingEngine.ts` blob `1149864a8c43e8b885eee2c4a9a1ce869dd8f338` is identical on `main`, at `39dd43eb…`, and at `6a8afbb2…`.

No transport, route, or persistence module was restored. The fence remains the only HTTP behaviour.

---

## 4. `R3` — persistence dependency: **OPEN / NOT ADMITTED** (object re-derived)

Re-verified from remote state this pass (decision request §4.1). Two results matter:

1. **The pin is not the NP-04 lineage.** `2d9130e7…` is an ancestor of IPD `main` (`behind 59`) and declares exactly three exports; `2e11fa3b…` is **diverged** (`26` ahead / `210` behind, merge-base `4d3e1cdc…`) and declares `./persistence`.
2. **The gap is implementation, not an export key.** `2e11fa3b…`'s `src/persistence` contains `store.ts`, `schema.ts`, `reportKey.ts`, `identity.ts`, and a `package.ts` barrel that is compiled by its `prepare`/`build:pit-package` script. IPD `main`'s `src/persistence` is a **different** persistence line (portfolios, principal bindings, broker import) with a **different** `openDatabase(filePath, version)` signature; a code search on `main` for `GovernedArtifactStore` returns **0**. Therefore adding an export key to `main` would not make the Reports store reachable — the store would have to be ported.

This corrects the earlier framing ("export-map gap") and it changes the option set. The decision request §4.3 records four options and recommends the third path newly identified this pass — **a second dependency specifier** to `2e11fa3b…` under a distinct package name, keeping the primary pin, Gate 3, and all three existing exports untouched. That pattern already exists in this repository (`iips-broker-import#70b24f02…` alongside `iips-production-market-data#2d9130e7…`). It still requires a PA act: it adds a lineage to the consumer surface.

**No pin, lockfile, export map, dependency specifier, or IPD object was changed.** IRR imports of `…/persistence` remain **0**.

---

## 5. `F-7` — harness committed; **F-7 NOT SATISFIED**

### 5.1 What was committed

| Path | Lines | Role |
|---|---|---|
| `frontend/server/reports-restart-harness.ts` | 144 | Evidence tooling. Runs the **real composed server** (`executive-transport`) in its own OS process, performs one operator step, prints one `RESULT:{…}` line, exits. Ops: `probe`, `durable-write`, `durable-read` (reserved, blocked). |
| `frontend/server/reports-restart.test.ts` | 132 | Executes the harness in **four separate processes** and compares results. |

Both follow the existing `owner-context-restart-harness.ts` / `owner-context-restart.test.ts` pattern (F-3, on `main`), so the restart-evidence mechanism is the one already accepted for NP-09/10/11 — not a new invention.

### 5.2 What it evidences today, and what it refuses to claim

| Evidenced | How |
|---|---|
| The `503` fence is identical in two independent processes | `probe` run twice; PIDs and ports differ; the full fence map is asserted equal |
| Route/method validation survives a restart | `404` bare namespace, `404` lookalike path, `405` with `Allow: POST` in both processes |
| An attempted durable write is refused and creates nothing | `durable-write` process: `POST /api/reports/artifacts` → `503 owner-context-unavailable`; the server-owned data domain is asserted **empty** afterwards |
| The rest of the composed server is unaffected | control probe `/api/portfolio` → `200` |
| **F-7 is not claimed** | the harness emits `f7Satisfied: false`, `durableLeg: 'not-executed'`, `prerequisites: {R1: 'not-established', R3: 'not-admitted'}`; the suite **asserts** those values, so a green run cannot be read as qualification |

### 5.3 F-7 five-part bar — status after this pass

| # | F-7 component | Status | Why |
|---|---|---|---|
| 1 | Positive ownership-boundary tests | **UNPROVEN** | No ownership contract exists to exercise (`D-1`). |
| 2 | Negative ownership-boundary tests | **UNPROVEN** | Same; and the historical negative cases exercise the retired authenticated contract. |
| 3 | Failure-mode tests | **PARTIAL — mechanism-level only.** Fail-closed refusal is now evidenced **across processes** (and was already evidenced in-process). F-7 states that fail-closed tests alone do not qualify a capability. | No owner contract, so failure modes are limited to "unavailable". |
| 4 | Separate-process durability / restart | **MECHANISM COMMITTED AND EXECUTED; DURABLE LEG NOT EXECUTED.** The harness exists and runs in CI; the durable leg is deliberately unimplemented (`durable-read` returns `blocked-R1-R3`). | Requires `D-1` + `D-3`. |
| 5 | No cross-domain equivalence absent `D-2` §8 | **PROVEN as a preserved prohibition** — no equivalence was created, and the fence refuses every operation. Does not qualify a mapping. | — |

**`F-7` remains NOT SATISFIED.** A committed harness is a precondition of the bar, not the bar.

### 5.4 Exact activation path for the durable leg

When `D-1` and `D-3` are rendered and the binding is admitted, the durable leg is added to `reports-restart-harness.ts` as two new ops and one new assertion set — no redesign:

1. `durable-write` (extended): perform `POST /api/reports/artifacts` under the **decided** owner contract; record `reportId`, `artifactVersion`, `reportKey`, and the file identity of the store the write landed in.
2. `durable-read` (replacing the `blocked-R1-R3` stub): a **fresh** process, same owner contract, same store path — `GET /api/reports/artifacts/:reportId` and `/supersession`, asserting the artifact, its version chain, and its `reportKey` survive process termination.
3. Negative restart legs: store path absent → `503`; owner source absent or tampered → `503`; restored → recovery **without** restart.
4. The harness flips `durableLeg` to `'executed'` **only** when both legs ran in separate processes; `f7Satisfied` stays `false` regardless — satisfaction is an acceptance determination, not a harness flag.

---

## 6. `CV-51` — acceptance preparation (no UI, no route)

`CV-51` remains **BLOCKED**. What follows is the prepared plan; nothing in it was executed.

### 6.1 Requirements derived from existing records

| Source | Requirement |
|---|---|
| NP-06 `D8` / §5.6 | Reports is the **seventh L1 product section**, presented with progressive disclosure: **1 summary** (identity fields, ownership scope, status), **2 detail** (canonical payload rendered, never redefined), **3 evidence/provenance** (provenance references, `reportKey` derivation, supersession chain), **4 replay/reference** (`reportId` + `artifactVersion` handles, supersession pointer to current version). |
| `CV-51` row | Owner-bound `D-2` §8 contract; `F-7` qualification incl. restart durability; Reports UI / no-auth port. |
| Commissioning §3 | No `/reports` mount, no Reports UI, no fence lift, no `CV-51` satisfaction until `F-7` and acceptance. |

### 6.2 Exact current state of the surfaces that would change

| Surface | Current state | Change required |
|---|---|---|
| `frontend/src/app/routes.ts` | 30 route constants; **no** `reports` entry | Add the Reports route constant(s) |
| `frontend/src/app/navigation.ts` | `NAV` has no Reports item | Add the seventh L1 entry **only** if the PA's navigation model says so — D8 says "seventh L1 section, sibling of — not nested within — existing sections" |
| `frontend/src/app/App.tsx` | 20+ `<Route>` entries; none for `/reports` | Mount the surface |
| `frontend/src/api/` | No `reports.ts` client | Add a typed client for the five fenced surfaces |
| `frontend/src/features/` | No `reports/` directory | Add the four-level disclosure surface |
| `frontend/server/reports-transport.ts` | Fence, blob `98147054…` | Replace **only** when the replacement has passed authorization **and** qualification |

### 6.3 Prepared implementation and test plan (not executed)

1. **Client**: typed read operations for `context`, `artifacts` (list), `artifacts/:id`, `artifacts/:id/supersession`; the write operations (`POST artifacts`, `POST versions`) only if the decided `R2` shape exposes them. Every call must render an explicit `owner-context-unavailable` state on `503` — never a fabricated empty result.
2. **Surface**: four disclosure levels in the order fixed by §5.6; the detail level renders the canonical payload as data (never re-derives it); the provenance level shows `reportKey` derivation and the chain; the replay level exposes `reportId`/`artifactVersion` handles.
3. **Route + navigation**: one entry, gated behind the same server-side owner boundary as the data (the UI must be honest when the owner context is unavailable).
4. **Tests**: route mount; navigation presence; four disclosure levels; all four UI states (loading, empty, unavailable, error); no client-supplied identity in any request body; no `companyId`/`runtimeCompanyId` anywhere in the client; `503` renders unavailable and never a stub artifact; the existing `/api/portfolio` and product suites remain green.
5. **Acceptance gates, in order**: `D-1` → `D-2` → `D-3` → `F-7` → capability acceptance → separate `CV-51` act → only then route/UI work. **Each is a separate act; none is implied by the previous.**

---

## 7. Executed evidence (fresh, this pass)

Environment: Node `v22.22.3`, npm `10.9.8`, Vitest `2.1.9`; `npm ci` completed in `frontend/` (189 packages) with the sandbox TLS workaround `NODE_EXTRA_CA_CERTS=/run/e2b/certs/ca-certificates.crt` (a sandbox requirement, not a repository change, and not used in CI).

| Command | Result |
|---|---|
| `npx vitest run server/reports/reports-canonical.test.ts` | **46 passed / 0 failed** |
| `npx vitest run server/reports/reports-artifact.test.ts` | **56 passed / 0 failed** |
| `npx vitest run server/reports-transport.test.ts` | **2 passed / 0 failed** (fence) |
| `npx vitest run server/reports-api.test.ts` | **2 passed / 0 failed** (composed route) |
| **`npx vitest run server/reports-restart.test.ts`** (new) | **5 passed / 0 failed** (4 separate OS processes) |
| `npm run test:ci` + `node .ci/assert-tests.js .vitest-report.json` | **101 files / 1,304 passed / 0 failed**; guard `OK`. Delta from the 2026-10-25 `main` baseline (100 / 1,299) is exactly this pass's new file (+1 file / +5 tests). |
| `npm run typecheck` | **exit 0** |
| `npm run typecheck:replay-server` | **exit 0** |
| `npx tsc --noEmit --strict …` on the two new files | **exit 0** |
| `npm run build` (`tsc -b && vite build`) | **exit 0** — 138 modules; `dist/assets/index-Bh4vcGJI.js` `1,590.96 kB` / gzip `222.05 kB` — **identical to the pre-change chunk**, confirming the server harness is not in the client bundle |

**Not executed, and not claimed:** the historical 32/32, 228/228, 14/14 suites; any live database run; any `./persistence` import; any Windows execution; any deployment or live deployment claim; any IPD write.

---

## 8. Separate statuses after this pass

| Status | Result |
|---|---|
| Historical implementation | **IMPLEMENTED, branch-qualified, D-3-accepted branch-only** at `39dd43eb…` / tip `6a8afbb2…`. Historical counts remain source-reported and were not re-executed. |
| Current implementation | **PARTIAL — non-production domain only**, plus a restart-harness scaffold. Persistence, `index.ts`, authenticated transport, route replacement, and UI are absent. The fence is the only HTTP behaviour. |
| Dependency integration | **NOT INTEGRATED.** No `./persistence` import; pin and specifiers unchanged. |
| Qualification | **NOT QUALIFIED.** `F-7` **NOT SATISFIED** (5.3). |
| Governance authorization | **COMMISSIONED — bounded non-production only**, plus this pass's investigation and harness work under §2(1)–(4). |
| Capability acceptance | **NOT ACCEPTED** on current `main`. |
| Production admission | **NOT ADMITTED. NOT PRODUCTION-READY.** |

---

## 9. Remaining blockers and the exact authority each one needs

| # | Blocker | Exact authority required |
|---|---|---|
| 1 | `R1` — ownership source **NOT ESTABLISHED** | One dated PA act choosing `R1-Option A`, `B`, or `C` (decision request §2.4). If `B`: owner/tenant values + the fifteen `D-2` §8 elements + replacement rows for NP-06 §5.4 rows 1–3. |
| 2 | `R2` — contract shape **UNBOUND** | One dated PA act **after** `R1` fixing: the `401` replacement, the authorization predicate, the tenant-claim disposition, and the audit disposition (decision request §3.3, C-2/C-3/C-4/C-7). |
| 3 | `R3` — consumer admission **OPEN** | One dated PA act choosing `R3-Option A/B/C/D` (decision request §4.3). `B` (recommended) adds a specifier; `C` requires `CV-23` §5 plus IPD write authority this installation does not hold. |
| 4 | `F-7` — **NOT SATISFIED** | Not a decision: it needs `R1` + `R3` satisfied, then execution of the committed harness's durable legs (5.4), then a qualification determination. |
| 5 | `CV-51` — **BLOCKED** | `F-7` and capability acceptance first, then a separate route/UI act (6.3). |
| 6 | Acceptance / production admission | Separate acts after the above. |

---

## 10. Next concrete action on the critical path

**The PA renders `D-1`** — one of `R1-Option A / B / C` from the decision request §2.4. Nothing downstream can move first: `R2` is defined by it, the `F-7` durable leg needs an owner, and `CV-51` needs `F-7`. `D-3` (`R3`) is independent of `D-1` and **can be rendered in the same act**, which is why its options are prepared separately.

---

## 11. Publication

Changed paths: the decision request; this execution record; `frontend/server/reports-restart-harness.ts`; `frontend/server/reports-restart.test.ts`; the canonical tracker (header summary; §5 change row; §16.12 dated note; §16.4.4 `CV-51` annotation; §16.108). Published through the ordinary review path as a separate PR, merged after green checks. Exact PR number, merge commit, CI run, and remote blob digests are established from the remote after merge, not self-embedded here.

*Execution support: Arena Agent Mode. No authority rendered. `R1` NOT ESTABLISHED, `R2` unbound, `R3` OPEN / NOT ADMITTED, `F-7` NOT SATISFIED, `CV-51` BLOCKED. Reports is not accepted, not admitted, and not production-ready.*
