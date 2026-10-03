# NP-15 — Broad IPD Phase 1 Convergence

**Work item:** NP-15
**Title:** Broad IPD Phase 1 convergence
**Category:** Governance
**Execution mode:** READ-ONLY GOVERNANCE INVESTIGATION
**Investigation date:** 2026-10-03 (UTC)
**Recording agent:** Arena Agent Mode (recording / investigation only)
**Program Authority:** Ramki (Ramakrishnan)
**Revision:** v1.2 — 17/17 required sections; IU-7 evidence gap recorded; prompt-compliance
matrix added (§19)

> **Boundary statement.** No source, configuration, schema, contract, persistence, ref, branch,
> tag, commit, merge, rebase, cherry-pick, push, deployment or production operation was performed
> in either repository. **No implementation authority is claimed or inferred from this record.**
> This file is an **additive, uncommitted** governance document placed in the working tree at
> `docs/integration/`, following the precedent of `IIPS_v3.0_G2_…_ARCHITECTURAL_DECISION.md` §10
> ("The only authorized repository mutation for this recording action is the addition of …").
> It is **NOT DURABLE** until committed, pushed and independently remote-verified.

> **Why this file lives inside the repository.** During this investigation the Arena workspace was
> re-provisioned three times. Each time, everything written **outside** the repository was
> destroyed — including two complete earlier versions of this record. The IRR repository survived
> every time. Per the NP-13 Universal Artifact Durability Invariant, the workspace is not
> authoritative; only the repository is.

---

## 0. REPOSITORY OPERATION LOG (§2 compliance)

Every operation below is **read-only** with respect to the authoritative remote.

| # | Repo | Remote | Ref | Commit | Operation | Read-only |
|---|---|---|---|---|---|---|
| 1 | **IRR** | `https://github.com/ramkivs/iips-review-recovered.git` | `refs/heads/main` | `bb756c040975ef9dc25e06cdfedd0e5129296ad3` | `git remote -v`, `git status`, `git rev-parse`, `git ls-remote`, `git log` | YES |
| 2 | **IRR** | same | `refs/heads/arena/01a1020f-iips-review-recovered` | `bb756c040975ef9dc25e06cdfedd0e5129296ad3` | working-tree inspection, `git ls-files`, grep | YES |
| 3 | **IRR** | same (GitHub API) | `main` | 100 most recent commits | `gh api .../commits`, `gh api .../git/trees` | YES |
| 4 | **IRR** | same (GitHub API) | `main` | — | `gh pr list`, `gh issue list`, `gh api repos/...` | YES |
| 5 | **IRR** | same | `main` @ `bb756c0` | `bb756c0` | **Local verification only:** `npm ci`, `tsc --noEmit`, `vitest run` in `frontend/` | YES (worktree clean before and after) |
| 6 | **IPD** | `https://github.com/ramkivs/iips-production-market-data.git` | `refs/heads/main` | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` | scratch clone to `/home/user/ipd-inspect` (outside IRR), full 94-commit history | YES |
| 7 | **IPD** | same | 30 remote branches + 4 tags + 6 PR refs | — | `git ls-remote`, `git log`, `git show`, `git diff`, `git merge-base`, `git rev-parse <ref>:<path>` | YES |
| 8 | **IPD** | same | `main` @ `4d3e1cd` | `4d3e1cd` | **Local verification only:** `npm ci`, `npm run build:tsc`, `npm test` | YES (worktree clean before and after) |
| 9 | **IPD** | same (GitHub API, after the scratch clone was destroyed) | `main` | `4d3e1cd` | `gh api .../contents/...?ref=main` | YES |
| 10 | **IRR** | same | working tree | `bb756c0` | **This record:** creation of one additive untracked markdown file. **No commit. No push. No history touched.** | n/a |

**No authoritative repository was mutated.** `git status --short` returned empty for IRR before and
after the verification run, and empty for the IPD scratch clone before and after its run.

---

## 1. Executive Summary

**NP-15 was opened as an unbound governance question and has been bounded by Program Authority.**
The investigation established that IPD is **not one baseline** — it has three unmerged heads plus a
fourth commit that IRR actually depends on — and that IRR's authoritative IPD dependency **cannot
be resolved against IPD's authoritative `main` ref at all**. On 2026-10-03 the Program Authority
bound NP-15 to the **narrow** Phase-1 scope (1A + 1B + 1C only), which removes those blockers from
scope.

Ten findings:

1. **IPD `main` lacks the PIT package boundary that IRR imports.** IPD `main` = `4d3e1cd`
   (2026-09-23) has **no `exports` map**; the `iips-production-market-data/pit` subpath that IRR's
   `ipdPitReadAdapter.ts` imports exists only from commit `0dab1221` onward, which is **not** on
   `main`.
2. **IRR pins IPD at `0dab1221`** (via `frontend/package.json` and `package-lock.json`), a commit on
   two Arena session branches (`arena/01a0e6d9`, `arena/01a0f308`), **not** on IPD `main`. Verified:
   `git merge-base --is-ancestor 0dab1221 origin/main` → **false**.
3. **Two mutually exclusive "NP-04 / NP04" durable-persistence implementations** exist on sibling
   IPD branches that both descend from `246cb94` and are not merged to `main`:
   - Line A — `arena/01a0e6d9`/`arena/01a0f308` @ `6828155` — *NP04-G24*: `better-sqlite3@13.0.3`,
     `src/portfolio/durable-store.ts`, `src/server/http-server.ts`, `src/auth/oidc-verifier.ts`,
     8 `tests/g24_*` suites, governance record `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md`.
   - Line B — `np04-governed-persistence-windows` @ `2e11fa3` — *NP-04*: Node `node:sqlite`
     (`DatabaseSync`), `src/persistence/store.ts`/`schema.ts`/`reportKey.ts`, exports `./persistence`.
     **No governance record of any kind.**
   Diff Line A → Line B: **50 files, +1,842 / −8,184 lines**, including deletion of the entire G24
   server/authorization/OIDC-verifier surface.
4. **The term "IPD" is ambiguous in the authoritative IRR corpus.** `NP-13-D1-PREREQ-01 §7.1` pins
   *"IPD (`iips-platform`) tree"* = `27104015…` — the **in-repo directory** — while
   `NP-13-GO3B-DECISION-01 §12.3.2` records IPD as the **external repository**
   `ramkivs/iips-production-market-data` @ `4d3e1cd`. §12.3.4 carries the variance forward
   **unresolved**. The in-repo `iips-platform` tree has since moved three times
   (`0004da6f` → `27104015` → `c5af3fe2` → **`001b1e3f` at HEAD**), so the NP-13 pin is **stale**.
5. **"IPD Phase 1" was not singly defined.** Two authored definitions exist
   (`FULL_IIPS_BI08_CONVERGENCE_PLAN.md` §15; `PHASE1_AUTHORIZATION_PREPARATION.md` §L),
   **Phase 1C appears in neither**, and a **second conflicting numbering** (PHASE-2/3/4/5 +
   F-3/F-8/F-9) was created afterwards, whose **Phase 5 re-did the Phase-1 shell restoration**
   (routes 13 → 36, nav items 13 → 32).
6. **IRR HEAD is RED.** `vitest run` → **2 failed / 272 passed / 25 skipped (299, 34 files)**, while
   `tsc --noEmit` → **PASS (exit 0)**. Both failures are in `frontend/server/**`.
7. **IRR and IPD certify incompatible 13-engine taxonomies.** IRR `iips-platform` certifies
   IES-006…015 + 016/017/020 as `sector.banking … sector.materials` and its product transport test
   **forbids** `sector.it`, `sector.chemicals`, `sector.realty`. IPD `src/engine_adapters/types.ts`
   certifies a different set including **`SECTOR_IT` and `SECTOR_CHEMICALS`** plus `CSIP_COMPOSITE`.
8. **Within the narrow Phase-1 boundary the convergence is genuinely complete and verified.**
   IPD `main` verifies **542/542 tests, 83 suites, tsc PASS**; the four frozen trees are intact
   (`8491efdc` / `9080e997` / `0062ad52` / `1597ed06`); OQ-1 (Option A) and OQ-2 (`c440` shell) were
   resolved as recommended and are recorded in `routes.ts`; the Phase-1B Windows evidence
   discrepancy was root-caused as a **Windows measurement-procedure defect** (stale `dist/`), not an
   implementation defect.
9. **NP-13 does not block NP-15.** Every NP-13 authority record places IPD **OUT OF SCOPE**, and
   D1-B expressly disclaims any repository/ref binding. NP-13 is **independent**, with a
   forward-looking soft dependency (D2 composition/membership) and one live conflict (the stale
   `iips-platform` pin).
10. **IU-7 is not reconstructable.** The NP-15 brief requires historical recovery of IU-7. It has
    **no durable artifact and no commit in either repository** — only two mentions inside G-2 §8 as
    a protected foundation ("PIT/IU-7"). See §3.5 and GAP-15.

**Disposition.** As investigated (unbound scope): **C — GOVERNANCE GAP REMAINS**.
**After the 2026-10-03 Program Authority scope binding to narrow Phase 1: A — READY FOR
CONVERGENCE DECLARATION**, subject to the single scope-confirmation item at §18.4.
See §15 for both determinations.

---

## 2. Current NP-15 Status

| Field | Value |
|---|---|
| Work item | **NP-15** |
| Title | **Broad IPD Phase 1 convergence** |
| Category | Governance |
| Status | **OPEN** → **SCOPE BOUND (2026-10-03); DECLARATION PENDING** |
| Execution mode | READ-ONLY INVESTIGATION (this record) |
| Production | OUT OF SCOPE — not accessed |
| Implementation authority | **NOT GRANTED by this prompt; NOT claimed by this record** |
| Final convergence authority | **TO BE DETERMINED / NOT YET DURABLY RECORDED** |
| Prior NP-15 definition | **NONE EXISTS** — NP-15 is a new identifier |
| NP-15 durable artifact | **NONE** |
| Scope binding | **BOUND 2026-10-03 to narrow Phase 1 = 1A + 1B + 1C** (§18) |

**Anti-reinterpretation check (per §1).** A case-insensitive, extension-agnostic search for `NP-15`
across the full IRR working tree (1,042 tracked files), the IPD working tree, IRR commit history
via GitHub API, and both repositories' PR/issue lists returned **zero hits**. NP-15 is therefore
**not** being reinterpreted from a prior work item; no historical NP-15 exists to conflict with.

---

## 3. Historical Reconstruction

Reconstructed from: IRR commit history (GitHub API, 100 most recent `main` commits), IPD full git
history (94 commits, scratch clone), and the durable governance artifacts in both trees.
Contradictions are reported, not silently reconciled.

**Classification key (per §5):** **A** = Historical fact · **B** = Superseded state ·
**C** = Current state · **D** = Unresolved state.

### 3.1 Chronology (IRR)

| Date (UTC) | Commit | Event | Class |
|---|---|---|---|
| 2026-08-13 | `c65d533` | `Import recovered IIPS workspace` — IRR created from a recovered Arena workspace | **A** |
| 2026-09-04 | `286f3da` … `e156cf6` | E2E-030 10-engine LTS certification; D42 opening authority; IES-016/017/020; 10 → 13 engines | **A** |
| 2026-09-05 | `5decdca` | `release: program-v1.2.0 — 13-engine successor LTS (MINOR) — Approved for Release (Ramki/Sai)` | **A** |
| 2026-09-29 | `a9a33b5` | **IU-5** — real non-production IRR → IPD PIT runtime integration (PR #1) | **A** |
| 2026-09-29 | `fb2ac13` | Client-side PIT API contract alignment + runtime integration test (PR #2) | **A** |
| 2026-09-29 | `37d07b0` | **IU-6** — repin IPD dependency to merged IU-6 PIT population commit `0dab1221` (PR #3) | **A** |
| 2026-09-29 | `f292a25` | **IU-8D** — reconcile IRR frontend transport to certified 13-engine set (PR #4) | **A** |
| 2026-09-29 | `4686b39` | **IU-8F-A** — reconcile engine and product transport test contracts to 13 certified engines (PR #6) | **A** |
| 2026-09-30 | `b7ed35e` | **G-2** — Durable User Portfolio Architectural Decision (PR #7). IRR baseline `19b42e7`; **IPD baseline `arena/01a0e6d9@0dab1221`** | **A** |
| 2026-10-01 | `4576864`…`b959438` | NP-12 screening governance + sector-reference population semantics (G1–G5) | **A** |
| 2026-10-01/02 | `2c86aba` → `3fc21b1` | NP-12 N4 Program Authority decisions → identifier authority → canonical byte grammar → **N4 Screen Definition implementation** | **A** |
| 2026-10-02 | `72bc2b0` | **NP-13-D0-01** — feature-baseline composition jurisdiction designated | **A** |
| 2026-10-02 | `0d87d6a` | **NP-13-D1-01** — G-O-3 selected; D1-B definition supplied (540 bytes, SHA-256 `29f2d5f6…5dcc7`); D1-C unresolved | **A** |
| 2026-10-02 | `fc86eed` | **NP-13-D1-C-01** — hybrid identity boundary decided | **A** |
| 2026-10-02 | `8bb84d5`…`21e3c93` | NP-12 N4-A3, A5, A6 contract authority + Screen contract specification | **A** |
| 2026-10-02 | `221ba44` | NP-12 N4-A8 implementation readiness determination (`A6-IMPL-10` confirmed open) | **A** |
| 2026-10-03 | `953638a` | NP-12 N4-A9 implementation authority decision | **A** |
| 2026-10-03 | `a0386fe` | **NP-12 N4-A10** — Controlled Increment 1 (engine-free Screen-side runtime) — **mutates `iips-platform/src/...`** | **A** |
| 2026-10-03 | `f5c66eb` | **NP-13-PA-D1C-SEMANTIC-RESOLUTION-01** — D1-C #1–#10 = **A / RESOLVED** (10/10) | **A** |
| 2026-10-03 | `81f0c28` | **NP-13-D1-CM-B** — D1 completion model = necessary-only / non-exhaustive; D1 remains open | **A** |
| 2026-10-03 | `c6ac439` | **NP-13-PA-D1-COMPLETION-01** — **A — DECLARE D1 COMPLETE** (condition-satisfaction only), 13:03Z | **A** |
| 2026-10-03 | `56aaad1` | **NP-13-PA-D2-DECISION-01** — **D2 = NOT ELIGIBLE**; future `NP-13-D2-01` definition gate **convening-authorized**, 13:16Z | **A** |
| 2026-10-03 | `bb756c0` | Merge PR #32 → **current IRR `main` HEAD** | **C** |
| — | — | **IU-7** — no artifact, no commit, no PR in either repository (§3.5) | **D** |
| — | — | **NP-01 … NP-11, NP-14** — no artifact in any inspected tree (§11) | **D** |

### 3.2 Chronology (IPD)

| Date (UTC) | Commit | Event | Class |
|---|---|---|---|
| 2026-09-08 | `e93b14a`, `eae2ff6` | Program v1.0 baseline; **divergence point full-IIPS vs BI** | **A** |
| 2026-09-19/20 | `fcf5dbe` … `a9d92ca` | WS-E UI01–UI14; P15/P16/P17; D114 10-year NSE archive parsers; Stage-4 legacy acquisition | **A** |
| 2026-09-21 | `94ad0e3` … `8697911` | P13–P17 certifications; v1.0.0-rc1 release candidate | **A** |
| 2026-09-21/22 | `83ba584` … `d2e0b49` | **BI-03 → BI-08** broker ingestion lineage; BI-07 host integration; BI-07 certification | **A** |
| 2026-09-22 | `005f732` → `94f519b` | PR #1 merge → **BI authority on `main`** (BI-01..BI-08 + D05 + identity) | **A** |
| 2026-09-22 | `d8f1fb2` | REMOTE-DURABILITY-BLOCKED — commit `798bc548` **unretrievable** | **A** |
| 2026-09-22 | `a34b6c4` | FULL-IIPS baseline forensic — *PLAUSIBLE, LINEAGE INCOMPLETE* | **B** |
| 2026-09-22 | `2561dd2` | **FULL_IIPS_BI08_CONVERGENCE_PLAN** — baseline **CONFIRMED**; Phase 0–9 plan; classifications A–F | **A** |
| 2026-09-22 | `1eb9c84` | **PHASE1_AUTHORIZATION_PREPARATION** — `PHASE-1 READY FOR AUTHORITY APPROVAL`, OQ-1/OQ-2 pending | **A** |
| 2026-09-22 | `f13002e` | **Phase 1A** — recover full-IIPS application shell (scaffold, unmounted) | **A** |
| 2026-09-22 | `144e8ed` | **Phase 1B** — mount shell with BI-08 PortfolioWorkspace at `/portfolio` | **A** |
| 2026-09-22 | `2714ffa` → `4096276` | Phase-1B Windows visual evidence intake: BLOCKED → **ACCEPTED WITH RECORDED DISCREPANCY** (§3.4) | **A** |
| 2026-09-22 | `881371e` → `bc3fb80` | **Phase 1C — Intelligence**: forensic **B / FAIL CLOSED**; Program Authority selects **Option B — DEFERRED COMPLETION; CONVERGENCE CONTINUES** | **A** |
| 2026-09-22 | `1026a76` | NEXT-PRODUCT-SURFACE designation packet — **no selection made** | **A** |
| 2026-09-22 | `8dfd8ec` → `ad2205a` | PHASE-2 Evidence (Option B), PHASE-3 Executive (Option A), PHASE-4 Research/UI03 (Option A) — all presentation-only, Path L | **A** |
| 2026-09-22 | `aef26c6` | **IIPS-HISTORICAL-CURRENT-CONVERGENCE-INVENTORY** — terminal classification **B** | **C** |
| 2026-09-23 | `e0355f7` | BI-08 → MASTER IIPS integration **FINAL RECONCILIATION = classification A / COMPLETE** | **C** |
| 2026-09-23 | `b31ed94` | MASTER IIPS + BI-08 **FULL INTEGRATION FORENSIC RECONCILIATION = classification B** | **C** |
| 2026-09-23 | `27e2173` → `28a6ed2` | **PHASE-5 OPTION A** — offline full-shell restoration. Routes 13→36, rendered 29, nav items 13→32, new `unavailable` status | **C** |
| 2026-09-23 | `ccab1cd`, `b217f7a` | Windows full-shell **visual + technical acceptance** (PR #2) | **C** |
| 2026-09-23 | `4f8db9d`, `c3d61a1` | **F-3** — UI08 Security Master functional surface (PR #3) → `/security-master` = `implemented` | **C** |
| 2026-09-23 | `373f0c0`, `f7cd994` | **F-8** act → **F-9** UI06 Multifactor Screener restoration (PR #4) → `/screener` = `partial` | **C** |
| 2026-09-28/29 | `96c3bac` … `246cb94` | **IU-1/2/3/5A/6** PIT series on `arena/01a0ec3d` → `arena/01a0e6d9` (PRs #5, #6). Merge commit `0dab1221` | **A** |
| 2026-09-30 | `8c99627`, `d4fdb33` | **NP04-G24** — durable persistence (SQLite/`better-sqlite3`), migrations `001`, `002` — **never merged to `main`** | **C** |
| 2026-09-30 | `6828155` | **NP04-G32** — canonical NP04 governance authority record — tip of `arena/01a0e6d9` **and** `arena/01a0f308` | **C** |
| 2026-10-02 | `d61ff9c` … `2e11fa3` | **NP-04** — common governed persistence (Node `node:sqlite`), exports `./persistence` — **never merged** | **C** |
| — | — | **Which IPD ref is authoritative** — not designated (§18.2) | **D** |
| — | — | **Engine taxonomy (IRR 13 vs IPD 13 + CSIP_COMPOSITE)** — not adjudicated (GAP-06) | **D** |

### 3.3 Contradictions found and adjudicated

| # | Contradiction | Earlier record | Later record | Adjudication |
|---|---|---|---|---|
| X-1 | FULL-IIPS baseline quality | `a34b6c4`: *PLAUSIBLE, LINEAGE INCOMPLETE* | `2561dd2`: **CONFIRMED** (`8b10968` content / `42f91fa` ref / tree `682f4e60`) | **Later governs.** |
| X-2 | Shell blobs identical across siblings | `2561dd2` §3.2: "identical across all three" | `1eb9c84` §B.4: **8 of 9 identical; `TopBar.tsx` on `a438` differs** (blob `41904b84`) | **Later governs.** |
| X-3 | `frontend/` untouched by the 10 post-baseline commits | `2561dd2`: "zero `frontend/src` files" | `1eb9c84` §A.2: true for `frontend/src`, **false for `frontend/server/pit/*`** | **Later governs.** |
| X-4 | "33 of 34" API-coupled | `2561dd2` headline | `1eb9c84` §C.1: **34/34 effectively coupled** | **Later governs.** |
| X-5 | BI-08 → MASTER integration | `aef26c6`: **B** | `e0355f7`: **A / COMPLETE**; `b31ed94`: **B** for the *full platform* | **Not a contradiction.** A = BI-08 scope; B = full platform scope. |
| X-6 | Meaning of "IPD" | `NP-13-D1-PREREQ-01 §7.1`: in-repo `iips-platform` tree `27104015` | `NP-13-GO3B-DECISION-01 §12.3.2/12.3.4`: external repo @ `4d3e1cd`; variance carried forward unresolved | **RESOLVED 2026-10-03 — split the term (§18.2).** |
| X-7 | Which IPD ref is authoritative for IRR | G-2: `arena/01a0e6d9@0dab1221` | IRR `package.json`: `0dab1221`; IPD `main`: `4d3e1cd` | **PARTIALLY RESOLVED.** Term split; ref designation **still open**. |
| X-8 | NP-04 persistence implementation | NP04-G24 (`6828155`) | NP-04 (`2e11fa3`) | **RESOLVED 2026-10-03 — both, domain boundary pending (§18.3).** |

### 3.4 The Phase-1B Windows discrepancy — root-caused

`PHASE1B-WINDOWS-EVIDENCE-INTAKE-MANIFEST.md` (IPD `main`), gate
`GATE-WINDOWS-PHASE-1B-VISUAL-EVIDENCE-INTAKE`, disposition **ACCEPTED WITH RECORDED DISCREPANCY**:

* Operator's technical-validation block reported `360/360 tests / 54 suites`; commit `144e8ed`
  empirically yields `392/392 tests / 61 suites`.
* Root cause (evidence-calibrated): **the discrepancy is explained by execution against stale
  precompiled `dist/` artifacts; the original measurement is therefore not accepted as
  representative of the Phase-1B source state.** `npm test` runs pre-compiled output
  (`node --test dist/tests/*.test.js`) and `dist/` is gitignored, so it survives `git checkout`;
  `360/360 / 54 suites` is the exact signature of checkpoint `1eb9c84`, the **pre-Phase-1A** state.
* Gate finding, verbatim: *"This is a measurement-procedure defect on the Windows host, not an
  implementation defect and not a visual-acceptance defect."*
* Outcome: **visual acceptance claims INTAKEN and ACCEPTED**; operator technical numbers
  **REJECTED as stale**, superseded by Arena's re-execution.

**Consequence:** this does **not** block a narrow-scope Phase-1 convergence declaration.

### 3.5 IU-7 — EVIDENCE GAP (honest disclosure)

The NP-15 brief requires historical reconstruction of IU-7. Search results:

| Search | Result |
|---|---|
| `grep -rn "IU-7"` across IRR (1,042 tracked files) | **2 hits**, both inside `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` §8 ("reopening or modifying PIT/IU-7"; "Protected RR↔IPD, PIT/IU-7, IU-8/13 engine … remain closed") |
| `grep -rn "IU-7"` across IPD | **0 hits** |
| IRR commit history (100 most recent `main` commits) | **0 commits** referencing IU-7 |
| IPD commit history (94 commits, all branches) | **0 commits** referencing IU-7 |
| IRR PRs (32) / issues (32) | **0** |

**Finding.** IU-7 is attested **only** as a name in G-2 §8's protected-foundations list, paired with
PIT. Its scope, outcome, artifacts and dates are **not reconstructable from either repository**.
Recorded as GAP-15. By contrast IU-5, IU-6, IU-8 are reconstructable (PRs #1, #2, #3, #4, #6).

---

## 4. Authoritative IRR Baseline

```text
Repository:
  IRR — ramkivs/iips-review-recovered
Remote:
  https://github.com/ramkivs/iips-review-recovered.git
Ref:
  refs/heads/main  (authoritative)
  refs/heads/arena/01a1020f-iips-review-recovered  (session branch, branched from main@bb756c0)
HEAD (as originally captured, 2026-10-03 ~13:2xZ):
  bb756c040975ef9dc25e06cdfedd0e5129296ad3
  "Merge pull request #32 from ramkivs/arena/01a101e0-iips-review-recovered"  2026-10-03T13:20:05Z
HEAD (as re-verified at the declaration gate, 2026-10-03) — CURRENT PUBLICATION BASELINE:
  79483c8586eb850f6f5ac82a763f497a48dfeaef
  "docs(np-13): publish D2 eligibility decision"
Remote parity:
  DRIFTED TWICE — remote `refs/heads/main` advanced during the investigation:
    bb756c0 → 8ca99ee1  (+2 commits: c3ff9125f, merge 8ca99ee1; +1 file
                         docs/integration/NP-13-D2-01-DEFINITION-01.md)   2026-10-03T14:15:06Z
    8ca99ee1 → 79483c8  (+1 commit; +1 file
                         docs/integration/NP-13-PA-D2-ELIGIBILITY-01.md)  2026-10-03
  Both deltas: additive NP-13 governance markdown only. NO code, config, schema, persistence,
  or dependency-pin change. Neither invalidates any NP-15 finding.
  Ancestry (GitHub compare API, then confirmed locally after `git fetch --unshallow`):
    bb756c0 IS an ancestor of 8ca99ee1 (ahead_by 2, behind_by 0);
    `git merge-base --is-ancestor bb756c0 origin/main` = TRUE post-unshallow.
Clean/Dirty:
  CLEAN — `git status --short` showed ONLY the untracked NP-15 records before publication.
  See the gate record §8 for the post-publication state.
Shallow-clone note:
  The local clone was depth-1, which made `git merge-base --is-ancestor bb756c0 origin/main`
  return FALSE and made `git merge --ff-only origin/main` fail with "refusing to merge unrelated
  histories". Both were LOCAL shallow-history artifacts, NOT remote facts. Resolved by
  `git fetch --unshallow origin` (local object fetch; remote untouched).
Evidence:
  §0 op 1–5; §4.1 verification table; §14 E-01…E-05; §4.5 drift re-verification
Caveats:
  1. Local clone is SHALLOW (depth 1). `git merge-base --is-ancestor bb756c0 origin/main`
     returns FALSE — a LOCAL shallow-history artifact, NOT a remote fact. The GitHub compare
     API is authoritative for ancestry. Local history cannot evidence anything predating the
     fetched tip; all reconstruction used the GitHub API.
  2. The IRR verification run at §4.1 was executed against bb756c0, not 8ca99ee. The +1 file
     added by PR #33 is a governance markdown document; it cannot have altered the §4.1 test
     or typecheck results. Not re-executed.
```

### 4.1 Verification performed (IRR)

| Check | Command | Result |
|---|---|---|
| Worktree clean | `git status --short` | **CLEAN** (0 entries) |
| Remote parity | `git ls-remote origin HEAD` | **MATCH** |
| Dependency install | `npm ci` in `frontend/` | **OK** — 184 packages |
| IPD pin resolution | `frontend/package-lock.json` | `git+ssh://git@github.com/ramkivs/iips-production-market-data.git#0dab1221fb0f89e2e0601ea905d642bfe72d5f9c` |
| IPD pin content | `ls node_modules/iips-production-market-data/dist/package` | `contracts`, `d114`, `normalization`, **`pit`** — IRR's `/pit` import **resolves at the pin** |
| Typecheck | `./node_modules/.bin/tsc --noEmit` | **PASS (exit 0)** |
| Tests | `npx vitest run` | **2 failed / 272 passed / 25 skipped** — 299 tests, 34 files, 23.85 s |

### 4.2 The two IRR test failures (fact, not interpretation)

| # | File / test | Assertion | Observed | Analysis |
|---|---|---|---|---|
| F-1 | `frontend/server/product-transport.test.ts` → *"Product responses reject taxonomy-resolved categories while permitting all certified engines"* | `expect(engineIds).toContain('sector.telecom')` | `expected [ 'sector.banking', …(12) ] to include 'sector.telecom'` | `executive-transport.ts:297` derives ``engineId = `sector.${o.sector.toLowerCase()}` ``. Registry `sectorFamily` values are **display names** (`Banking`, `Telecommunications`, `Automobile`, `Materials & Metals`), so the transport emits `sector.telecommunications`, never the slug `sector.telecom`. 13 engine IDs produced; slug form absent for all three deferred engines. |
| F-2 | `frontend/server/pit/pitRuntimeIntegration.test.ts` → *"IU5R-13 the company route is still handled by the company handler"* | `expect(body).toHaveProperty('error')` | `expected { companyId: 'Banking-H1', …(10) } to have property "error"` | The test's own header comment states it asserts a **pre-existing platform defect** (`ENGINE_FACTORY[s.engineId] is not a function`) at pinned baseline `acd1556d5`. At HEAD the company route **no longer errors**, so the pinned-baseline expectation is stale. |

**Attribution: UNRESOLVED.** The shallow clone prevents local bisection.
`product-transport.test.ts` last substantively changed at `4686b39` (2026-09-29, IU-8F-A);
`iips-platform` last changed at `9f93c6c8a` (2026-10-03, NP-12 N4-A13). Recorded as **RED AT HEAD**.

### 4.3 Latest NP-01–NP-14 durable artifacts present in IRR

Only **NP-12** and **NP-13** artifacts exist (verified at HEAD and against trees at `c65d533`,
`19b42e7`, `3e56ef0`, `bb756c0` via GitHub API). No NP-01…NP-11 artifact and no NP-14 artifact
exists in **any** inspected tree.

### 4.4 Relevant convergence/governance records (IRR)

| Record | Path | Subject |
|---|---|---|
| G-2 | `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` | **IPD owns the portfolio domain and durable persistence boundary** |
| Opening Authority | `docs/integration/IIPS_v3.0_OPENING_AUTHORITY_DECISION.md` | Additive authority-decision precedent |
| G3 / OIDC | `docs/v3.0/g3-build/**` | Identity boundary, Keycloak architecture, principal-tenant mapping, `AUTHENTICATION_AUTHORITY_HARD_STOP.md` |
| D114 | `docs/integration/IIPS_v3.0_D36_HISTORICAL_SOURCE_ACCEPTANCE.md`, `E2E-030_CERTIFICATION.md` | Historical market-data acceptance |
| NP-13 series | `docs/integration/NP-13-*.md` (12 files) | Feature-baseline composition jurisdiction, governed object, identity boundary, D2 eligibility |

---

## 5. Authoritative IPD Baseline

```text
Repository:
  IPD — ramkivs/iips-production-market-data
Remote:
  https://github.com/ramkivs/iips-production-market-data.git
Ref:
  refs/heads/main  (MEASURED / INVESTIGATED BASELINE — see caveat 1 below)
HEAD:
  4d3e1cdca3a33da0ec3be8b336b17128108a502c
Commit:
  "Merge pull request #4 from ramkivs/arena/01a0ce79-iips-production-market-data"  2026-09-23T17:13:40Z
Clean/Dirty:
  CLEAN — `git status --short` empty (scratch clone, verified before and after)
Remote parity:
  PARITY — `git ls-remote origin refs/heads/main` = 4d3e1cdca3a33da0ec3be8b336b17128108a502c  (MATCH)
  Re-verified at the declaration gate 2026-10-03: UNCHANGED (no drift on IPD).
Evidence:
  §0 op 6–9; §5.1 verification table; §14 E-06…E-27
Topology:
  30 remote branches · 4 tags · 6 PR refs · 94 commits on main
Caveat 1 — MEASURED vs DESIGNATED (do not conflate):
  This coordinate is the MEASURED / INVESTIGATED BASELINE used by NP-15. It is
  NOT a FORMALLY DESIGNATED AUTHORITATIVE REF. D-NP15-2 (designate the authoritative
  IPD ref/commit) remains OPEN and separately identified. No act in NP-15 designates
  ramkivs/iips-production-market-data @ refs/heads/main @ 4d3e1cdc… as authoritative.
  NP-15 declares convergence AGAINST this measured baseline; it does not establish it.
Caveat 2:
  The IPD scratch clone was destroyed by a workspace re-provision; the re-verification
  at this gate was performed read-only via the GitHub API (§0 op 9).
```

### 5.1 Verification performed (IPD `main`)

| Check | Result |
|---|---|
| `npm ci` | OK |
| `npm run build:tsc` | **PASS** (0 errors) |
| `npm test` | **542 tests · 83 suites · 542 pass · 0 fail · 0 skipped** |
| Frozen tree `frontend/src/features/portfolio` | `8491efdc44ae449eedf1aaf93fbc7415c428fcb9` — matches convergence records |
| Frozen tree `src/identity` | `9080e997ee7da977d0066431737e329e88b3c0b7` — matches |
| Frozen tree `src/d114` | `0062ad520dce647f3d02ed9a27739598d457faaa` — matches |
| Frozen tree `src/ui` | `1597ed0663ee6a450dac7e9c6959748a1a85b05e` — matches |
| `package.json` `exports` map | **ABSENT at `main`** |
| `src/portfolio/` directory | **ABSENT at `main`** |

### 5.2 The four IPD heads that matter (verified by `git merge-base`)

| Ref | Tip | Date (UTC) | Contains | Ancestry |
|---|---|---|---|---|
| `main` | `4d3e1cd` | 2026-09-23 17:13 | Master-IIPS shell convergence (1A/1B/1C/2/3/4/5, F-3 UI08, F-9 UI06); BI-01..BI-08; D114; D05; SPI; Operator Drop | **ancestor of all three below** |
| `arena/01a0e6d9-…` **=** `arena/01a0f308-…` | `6828155` | 2026-09-30 18:21 | `main` **+** IU-1/2/3/5A/6 PIT package (PRs #5,#6) **+** **NP04-G24 persistence** (`better-sqlite3@13.0.3`, `/api/ipd`, OIDC verifier, `tenant_memberships`) **+** NP04-G32 record | descendant of `main`; **sibling of `np04-…`** (merge-base `246cb94`) |
| `np04-governed-persistence-windows` | `2e11fa3` | 2026-10-02 12:50 (18:20 +0530) | `main` **+** IU-1/2/3/5A/6 PIT package **+** **NP-04 common governed persistence** (Node `node:sqlite` `DatabaseSync`, `GovernedArtifactStore`, `reportKey`/`reportId`, exports `./persistence`) | descendant of `main`; **sibling of `arena/01a0e6d9-…`** |
| `arena/01a0c440-…` | `42f91fa` | 2026-09-22 09:31 | The **FULL-IIPS donor** (content baseline `8b10968`, `frontend/src` tree `682f4e60`) — 1,177 files, 97 `.tsx`, 71 `frontend/server/` files, `core/auth/**` | **archival donor — never merged** |
| *(dependency pin)* `0dab1221` | `0dab1221` | 2026-09-29 13:24 | PR #6 merge — **the exact commit IRR depends on** | descendant of `main`; NOT ancestor of `main`; ancestor of `6828155`; NOT ancestor of `2e11fa3` |

```text
git merge-base --is-ancestor 0dab1221 origin/main   → FALSE  (IRR's pin is not on IPD main)
git merge-base --is-ancestor origin/main 0dab1221   → TRUE
git merge-base --is-ancestor origin/main 6828155    → TRUE
git merge-base --is-ancestor origin/main 2e11fa3    → TRUE
git merge-base 6828155 2e11fa3                      → 246cb944e174dee09b7c08ffa93bfa672dca059c
git branch -a --contains 0dab1221                   → arena/01a0e6d9-…, arena/01a0f308-…
```

### 5.3 Hard contract break: IRR cannot build against IPD `main`

`frontend/server/pit/ipdPitReadAdapter.ts` (IRR) imports:

```ts
import { PitReadService } from 'iips-production-market-data/pit';
import type { DataProvenanceDTO, PointInTimeStore } from 'iips-production-market-data/pit';
```

The `./pit` subpath export is **added at commit `0dab1221`** and **does not exist at IPD `main`
`4d3e1cd`** (whose `package.json` has **no `exports` field at all**). Therefore:

> **IRR's authoritative IPD dependency is satisfiable only from a commit that is not on IPD's
> authoritative `main` ref.** Any naive "convergence onto IPD main" would break the IRR build.

*Status after the 2026-10-03 decisions:* **out of narrow Phase-1 scope**; retained as GAP-02.

### 5.4 IPD persistence-conflict detail

```
git diff --stat 6828155 2e11fa3  →  50 files changed, 1,842 insertions(+), 8,184 deletions(-)
```

| Surface | Line A `6828155` (NP04-G24) | Line B `2e11fa3` (NP-04) |
|---|---|---|
| Substrate | `better-sqlite3@13.0.3` (exact-pinned dep) | Node built-in `node:sqlite` (`DatabaseSync`) — **no new dependency** |
| Entry points | `src/persistence/bootstrap.ts`, `connection.ts`, `migrations/{runner,registry,001,002}.ts` | `src/persistence/db.ts`, `schema.ts`, `store.ts`, `identity.ts`, `reportKey.ts`, `package.ts` |
| Domain | User portfolios, holdings, identity mapping, `tenant_memberships` | Governed **artifact/report** store (reportType, portfolioId, scenario, canonicalPayload, provenance, supersession) |
| Network/auth | `src/server/http-server.ts` (`/api/ipd/*`), `src/auth/oidc-verifier.ts`, `src/auth/jwks.ts`, audience `ipd-user-portfolio-api` | **none** |
| Tests | `tests/g24_a..h` (8 suites; record states 84 assertions; full suite 782/782) | `tests/np04_governed_persistence.test.ts` (749 L) |
| Governance record | `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md` (415 L, act `np04-governance-authority-record-2026-09-30-001`) | **NONE** |
| Package export | — | `./persistence` |

`src/persistence/errors.ts` and `src/persistence/index.ts` exist in **both** lines with **different
content** → the two lines cannot both be applied without a written domain boundary (D-NP15-4).

### 5.5 IPD `main` route/navigation census (verified at `4d3e1cd`)

`NavStatus` = `implemented | partial | unavailable | future` (fourth status added by Phase 5
Option A). Verified in `frontend/src/app/navigation.ts` and `routes.ts`:

| Status | Count | Examples |
|---|---|---|
| `implemented` | **2** | `/portfolio` (BI-08, + `Overview` child), `/security-master` (UI08, F-3) |
| `partial` | **6** | `/executive` (UI02), `/research` (UI03), `/intelligence` (UI04), `/evidence` (UI11 + `Decision Evidence` child), `/screener` (UI06, F-9) |
| `unavailable` | **20** | all 8 `/admin/*` tabs, `/research/{company,sector,events,cross-sector,macro}`, `/intelligence/decision-matrix`, `/collaboration`, `/reports`, `/watchlists`, `/settings`, `/callback` |
| `future` | **5** | `/replay`, `/intelligence/{opportunities,risks,rankings}`, `/screener/governed` |

Route constants: **36** (26 donor + 2 current-base + donor future-markers); rendered paths: **29**.

### 5.6 IPD OQ-1 / OQ-2 resolution

Resolved as recommended, recorded in source. `frontend/src/app/routes.ts` header:

> `Governed under: AD-01..AD-18 / Phase-1A Authority Decision (OQ-1 = Option A, OQ-2 = c440) + phase5-offline-full-shell-restoration-2026-09-23-001 (Option A)`

`react-router-dom ^6.30.6` present in IPD `main` `package.json`. Donor tree
`682f4e6029818c839f23211ae5067eed862c5037` cited in `routes.ts`, `navigation.ts`, `App.tsx`.
**OQ-1 and OQ-2 are no longer open.**

### 5.7 IPD standing prohibitions (reaffirmed, unchanged)

```text
D115 C / D                    : UNRESOLVED / WITHHELD / NOT AUTHORIZED
runtimeCompanyId              : UNRESOLVED
implementationAuthority       : WITHHELD
productionEligible            : false
Tenant source of truth        : D115-deferred
Tenant administration         : NOT AUTHORIZED
Cross-system security audit   : UNRESOLVED / DEFERRED
Live Keycloak verification    : ENVIRONMENT-DEPENDENT OUTSTANDING
G-034 (live provider)         : NOT EXECUTED
D91/D88 (macro)               : standing constraint — Macro EXCLUDED
Dhan Level-1 (live feed)      : DEFERRED (fixture-level only)
client-side auth              : NONE — grep-verified 0 keycloak / oidc / authFetch in frontend/src
```

---

## 6. Phase 1 Scope

### 6.1 What "Phase 1" authoritatively means in IPD

| Source | Commit | Definition of "Phase 1" |
|---|---|---|
| `docs/FULL_IIPS_BI08_CONVERGENCE_PLAN.md` §15 | `2561dd2` | **Phase 1 = "Port shell + pure kit"** — ADD `app/{AppShell,TopBar,Sidebar,navigation}`, `core/session/*`, 11 API-pure components, shell CSS. Phase 1.5 = mount BI; Phase 2 = routing. |
| `docs/PHASE1_AUTHORIZATION_PREPARATION.md` §L | `1eb9c84` | **Phase 1A** = shell recovery (additive: 9 shell files + 11 pure components + `FeaturePlaceholder` + `navigation.test.ts`); **Phase 1B** = BI-08 route mount at `/portfolio`, hoist Tier-B singletons. 19 acceptance criteria AC-01..AC-19. |
| `PHASE1C-INTELLIGENCE-DEFERRED-COMPLETION-AUTHORITY-RECORD.md` | `bc3fb80` | **Phase 1C** = Intelligence payload → forensic **B / FAIL CLOSED** → **Option B: DEFERRED COMPLETION**. **Appears in neither Phase-1 document above.** |
| PHASE-2/3/4/5 + F-3/F-8/F-9 acts | `f9101be` … `28a6ed2` | A **second, non-aligned numbering**: PHASE-2 Evidence, PHASE-3 Executive, PHASE-4 Research/UI03, **PHASE-5 offline full-shell restoration** — which **re-executes the Phase-1 shell recovery** (13 → 36 route constants). |

### 6.2 Binding applied 2026-10-03 (**AUTHORITATIVE**)

> **NP-15 is bound to the NARROW Phase 1 scope: Phase 1A + Phase 1B + Phase 1C only.**
> Selected by Ramki (Program Authority), 2026-10-03. See §18.1.
>
> This is the only scope with an authored definition
> (`docs/PHASE1_AUTHORIZATION_PREPARATION.md` §L, acceptance criteria AC-01..AC-19).
> Persistence, the IRR↔IPD dependency pin, the engine taxonomy, and IRR itself are **outside**
> the bound scope.

### 6.3 Narrow Phase 1 inventory and per-element status

| Element | Executed at | Artifact at IPD `main` `4d3e1cd` | Status |
|---|---|---|---|
> **Reading rule (applies to the whole table).** Four distinct states are kept separate and must
> not be collapsed:
> **(1) historical Phase-1A/B/C execution** · **(2) current IPD `main` state** ·
> **(3) Phase-5 later restoration/supersession** · **(4) the resulting declaration relationship.**

| Element | Executed at | Historical execution artifact | State at IPD `main` `4d3e1cd` | Status |
|---|---|---|---|---|
| **1A — shell recovery** (9 files) | `f13002e` | Added `app/{AppShell,TopBar,Sidebar,navigation,routes}.ts(x)`, `core/session/{SessionContext,session}`, `core/theme/theme`, `core/tokens/index`. **13 routes, nav = 2 implemented / 11 future** | `routes.ts` **modified**, `navigation.ts` **modified**, `AppShell.tsx` **modified** by Phase 5; **36 route constants, 32 nav items** | **HISTORICAL EXECUTION VERIFIED at `f13002e`; SUPERSEDED at `main` by Phase 5 (see §6.4).** Declaration target pending D-NP15-9. |
| **1A — presentation kit** (11 API-pure) | `f13002e` | Added `components/{ui/Badges, data/DataComponents, decision/DecisionComponents, viz/ChartFoundations, state/StateComponents, interaction/InteractionComponents, evidence/EvidenceComponents, evidence/EvidenceExplorerComponents, evidence/Ad17Disclosure, company/CompanyHeader, shell/ShellStates}.tsx` | **UNMODIFIED by Phase 5** (no `components/**` file appears in `6b8afda`) | **HISTORICAL EXECUTION VERIFIED; NOT SUPERSEDED** |
| **1A — `FeaturePlaceholder`** | `f13002e` | Added `app/FeaturePlaceholder.tsx` | **UNMODIFIED by Phase 5** | **HISTORICAL EXECUTION VERIFIED; NOT SUPERSEDED** |
| **1B — BI-08 route mount at `/portfolio`** | `144e8ed` | Modified `App.tsx`, `main.tsx`, `index.css`, `vite.config.ts`; added `tests/shell_mount_bi08_route.test.ts` | `/portfolio` = `implemented`; BI tree frozen `8491efdc` **UNCHANGED**; `shell_mount_bi08_route.test.ts` **modified** by Phase 5 and **passing** (542/542) | **HISTORICAL EXECUTION VERIFIED; MOUNT PRESERVED THROUGH Phase 5** |
| **1B — Windows visual acceptance** | `4096276` manifest | `GATE-WINDOWS-PHASE-1B-VISUAL-EVIDENCE-INTAKE` | **ACCEPTED WITH RECORDED DISCREPANCY** (§3.4) | **ACCEPTED — Phase-1B scope only. NOT a Phase-8 Windows acceptance.** |
| **1C — Intelligence** | `881371e` → `bc3fb80` | **Governance record only — zero code change.** Added `PHASE1C-INTELLIGENCE-DEFERRED-COMPLETION-AUTHORITY-RECORD.md` + `.json` | `/intelligence` (UI04) = **`partial`**; Decision Matrix = `unavailable`; **M-1..M-5 OPEN** | **PHASE-1C GOVERNANCE GATE CLOSED — DEFERRED COMPLETION AUTHORIZED. Intelligence functionality is NOT complete.** |

> **Terminology guard — Phase 1C.** The accepted state is
> **"Phase 1C governance gate closed — deferred completion authorized."** This means the
> *governance disposition* of the deferred Intelligence subject matter was decided and recorded.
> It does **NOT** mean Intelligence functionality is complete, that `/intelligence` is implemented,
> or that the deferred subject-matter items (M-1..M-5) have been resolved. The declaration
> distinguishes **governance closure of the deferred Phase-1C disposition** from
> **functional completion of Intelligence**. `/intelligence` remains `partial`.

### 6.4 The Phase-5 boundary — now evidenced, not assumed (D-NP15-9)

Phase 5 Option A has been measured against Phase 1A commit-by-commit. **The contradiction is now a
fact, not an inference.**

```text
f13002e  Phase 1A   2026-09-22T16:08:42Z  ADDED (24 files):
                    app/{AppShell,FeaturePlaceholder,Sidebar,TopBar,navigation,routes}
                    core/session/{SessionContext,session}, core/theme/theme, core/tokens/index
                    components/** (11 API-pure + useDialogFocus + useTabList)
                    tests/shell_navigation_model.test.ts
                    → nav: 2 implemented / 11 future  ·  13 route constants

144e8ed  Phase 1B   2026-09-22T16:33:29Z  MODIFIED App.tsx, main.tsx, index.css, vite.config.ts
                    ADDED  tests/shell_mount_bi08_route.test.ts

bc3fb80  Phase 1C   2026-09-22T17:52:11Z  ADDED governance record + json ONLY. Zero code change.

6b8afda  Phase 5    2026-09-23T07:50:03Z  MODIFIED app/App.tsx, app/AppShell.tsx,
                                                   app/navigation.ts, app/routes.ts
                                          ADDED    app/OfflineOverlays.tsx,
                                                   app/UnavailableSurface.tsx
                                          MODIFIED tests/shell_navigation_model.test.ts   (1A test)
                                          MODIFIED tests/shell_mount_bi08_route.test.ts   (1B test)
                                          ADDED    tests/shell_offline_full_shell_restoration.test.ts
                    → 36 route constants, 32 nav items, new `unavailable` status

28a6ed2  Phase 5    2026-09-23T07:53:26Z  ADDED governance record ONLY. Zero code change.
```

**Findings:**

1. **Phase 5 directly modifies Phase-1A-created files.** `routes.ts`, `navigation.ts` and
   `AppShell.tsx` were created by Phase 1A (`f13002e`) and **modified** by Phase 5 (`6b8afda`).
2. **Phase 5 directly modifies the Phase-1A and Phase-1B test files.**
   `tests/shell_navigation_model.test.ts` (created 1A) and `tests/shell_mount_bi08_route.test.ts`
   (created 1B) were both **modified** by Phase 5.
3. **Therefore the shell at IPD `main` `4d3e1cd` is NOT the Phase-1A artifact.** It is the
   Phase-5 restoration. Phase 5 is a genuine structural **supersession** of Phase 1A's shell
   (13 → 36 route constants, 13 → 32 nav items).
4. **Phase 1A's presentation kit and `FeaturePlaceholder` were NOT superseded.** No `components/**`
   file appears in `6b8afda`.
5. **Phase 1B's BI-08 mount survives Phase 5.** The BI tree is frozen at `8491efdc` (UNCHANGED) and
   IPD `main` verifies **542/542 tests, 83 suites, 0 fail**.
6. **Phase 1C introduced no code.** `bc3fb80` is governance-only.

**Consequence.** The Phase-1A declaration target **cannot be silently stated as "verified at IPD
`main`"** — that assertion conflates (1) historical execution with (2) current state and (3) Phase-5
supersession. The Program Authority must select the declaration target. **Neither reading is assumed
by this record.**

| Option | Declaration target for Phase 1A |
|---|---|
| **Phase 5 IN SCOPE** | Phase 1A declared converged **as restored by Phase 5 Option A** (36 route constants, 32 nav items, `unavailable` status) at IPD `main` `4d3e1cd`. |
| **Phase 5 OUT OF SCOPE** | Phase 1A declared converged **as executed at `f13002e`** (13 route constants, 2 implemented / 11 future); Phase 5 recorded as a separate later shell-restoration/superseding workstream, **not retroactively incorporated into narrow NP-15 Phase 1**. |
| **BOTH, DECLARED SEPARATELY** | Phase 1A converged at `f13002e` **and** Phase 5 converged at `6b8afda` — two declarations, one record. |

### 6.5 Broader scope — recorded as OUT OF NP-15

Investigated and **removed from NP-15 by the narrow binding**, retained as gaps for their own
workstreams: IRR↔IPD pin (GAP-02), IPD ref designation (GAP-03), persistence (GAP-04 — decided but
held in reserve), engine taxonomy (GAP-06), IRR HEAD red state (GAP-07), IU-7 (GAP-15).

---

## 7. Convergence Architecture

### 7.1 Actual current topology (measured)

```
                     IPD  ramkivs/iips-production-market-data
                     ────────────────────────────────────────
  eae2ff6 (2026-09-08) ── divergence: FULL-IIPS  vs  BI
     │
     ├── arena/01a0c440 @ 42f91fa ── ARCHIVAL DONOR (tree 682f4e60; core/auth/**; frontend/server/**)
     │        └── content extracted by Phase 1A/1B; branch never merged
     │
     └── BI LINEAGE ── 94f519b (PR #1) ── main
                              │
                              ├── 4d3e1cd  ◀── IPD  main  (2026-09-23) ── 542/542 PASS
                              │        Phase 1A/1B/1C/2/3/4/5 · F-3 UI08 · F-9 UI06
                              │
                              ├── 0dab1221 ◀── IU-6 PIT population (PR #6, 2026-09-29)
                              │        │        ★ IRR DEPENDENCY PIN — NOT ON main
                              │        │
                              ├────────┴── arena/01a0e6d9 == arena/01a0f308 @ 6828155
                              │                 └─ + NP04-G24 persistence (better-sqlite3)
                              │                    + NP04-G32 governance record
                              │
                              └────────── np04-governed-persistence-windows @ 2e11fa3
                                              └─ + NP-04 common governed persistence (node:sqlite)
                                                 (NO governance record)


                     IRR  ramkivs/iips-review-recovered
                     ─────────────────────────────────
  c65d533 (2026-08-13, recovered workspace)
     │
     ├── iips-platform/   (in-repo; 13 certified engines; tree 001b1e3f at HEAD)
     │        ★ NP-13-D1-PREREQ-01 §7.1 labels THIS as "IPD" (pin 27104015 — now STALE)
     │
     ├── frontend/server/pit/*  ── PitReadPort ──▶ iips-production-market-data/pit @ 0dab1221
     │                                              ★ resolves only OFF main
     │
     └── bb756c0  ◀── IRR main HEAD (2026-10-03) ── 272/299 pass, tsc PASS
              NP-12 N4 · NP-13 D0/D1/D1-C · G-2
```

### 7.2 Dependency graph with dispositions

```
B1 / "original B1 platform baseline" ............ NOT IDENTIFIED IN EITHER REPOSITORY (terminology note)
 │
 ├── Dhan / provider-neutral SPI
 │      IPD: src/spi/provider_spi.ts (P02); Dhan adapters in
 │           frontend/src/features/portfolio/import/; DHAN_WEB_UI_SUMMARY_V1 authorized for BI-07
 │      IRR: NO Dhan implementation; G-2 §8 forbids reimplementation .......... SEPARATE BY DESIGN
 │
 ├── "D7 engine lineage" ........................ NOT IDENTIFIED AS A WORKSTREAM (terminology note)
 │      Actual engine duplication found: IRR iips-platform/src/sector-engines/* (13, IES-006..020)
 │                                    vs IPD src/engine_adapters/frozen_engines.ts (13 + CSIP_COMPOSITE)
 │                                    .......................................... CONFLICT (GAP-06)
 │
 ├── persistence
 │      Line A  arena/01a0e6d9 @ 6828155 (NP04-G24, better-sqlite3, /api/ipd, OIDC verifier)
 │      Line B  np04-...windows @ 2e11fa3 (NP-04, node:sqlite, artifact store, ./persistence)
 │      main    none ........................................................... CONFLICT (GAP-04)
 │              → DECIDED 2026-10-03: both retained, domain boundary to be written
 │
 ├── portfolio / holdings
 │      IPD BI-08 (AUTHORITATIVE, frozen 8491efdc)  vs  historical full-IIPS (NOT PORTED)
 │      vs  IRR certified reference /api/portfolio (PROTECTED) ..... 3 distinct semantics, no conflict
 │
 ├── Operator Drop
 │      IPD src/operator_drop/{index,parser}.ts (P16-08/AD-17) + evidence/operator_drop/**
 │      IRR: protected/frozen by G-2 §8; no module ......................... SEPARATE BY DESIGN
 │
 ├── OIDC / operator-drop lineage
 │      IRR: core/auth/**, frontend/server/live/real-oidc-verifier.ts, keycloak-provision.mjs,
 │           docs/v3.0/g3-build/** (G3 certified)
 │      IPD: EXCLUDED — zero client-side auth, grep-verified .............. SEPARATE BY DESIGN
 │
 ├── IRR ↔ IPD integration
 │      IU-5/IU-6 PIT runtime integration — REAL, TESTED, but pinned off-main ... CONTRACT GAP (GAP-02)
 │      IU-7 — NO DURABLE EVIDENCE .......................................... EVIDENCE GAP (GAP-15)
 │      G-2 durable portfolio consumption boundary — DEFINED, NOT IMPLEMENTED, NOT AUTHORIZED
 │
 └── completed NP product capabilities
        NP-12 N4 Screen Definition: implemented + certified (IRR) ............. CONVERGED / VERIFIED
        NP-13: D0/D1 complete (governance); D2 not eligible ................... GOVERNANCE-OPEN (IRR)
```

**Terminology note.** The dependency sketch in the NP-15 brief references `B1 platform baseline`,
`D7 engine lineage`, and `Dhan/provider-neutral SPI`. Only the Dhan / provider-neutral SPI maps to
a named artifact. `B1` occurs in the IRR corpus **only** as a decision-item label
(`NP-12-N4-PROGRAM-AUTHORITY-DECISION-RECORD.md` §"B1. Definition content and population binding");
`D7` occurs **only** as a decision item (`NP-12-N4-A9-IMPLEMENTATION-AUTHORITY-DECISION.md`
§"D7 — Determinism of hash-bearing provenance") and as `N4-D7 — Duplicate predicates`. **Neither
"B1 platform" nor "D7 engine" is a durable workstream identifier in either repository.** They are
reported as UNKNOWN rather than mapped by assumption (GAP-14).

---

## 8. Component-by-Component Convergence Matrix

Legend: `CONVERGED` · `CONVERGED / VERIFIED` · `SEPARATE BY DESIGN` · `HISTORICAL / ARCHIVAL` ·
`GOVERNANCE GAP` · `CONTRACT GAP` · `EVIDENCE GAP` · `IMPLEMENTATION GAP` · `NOT APPLICABLE` ·
`UNKNOWN / REQUIRES AUTHORITY`.

| # | Component | Historical lineage | Current authoritative location | Already converged? | Separate by design? | Conflict? | Evidence | Action |
|---|---|---|---|---|---|---|---|---|
| 1 | **B1 platform** | not identified | — | — | — | — | zero hits for a "B1 platform" workstream | **UNKNOWN / REQUIRES AUTHORITY** |
| 2 | **Dhan / broker ingestion** | FINAPP `b97b103` → BI-03/04/05 | IPD `main`, frozen `8491efdc` | **YES** | IRR must not reimplement (G-2 §8) | No | `evidence/bi04/*`, `evidence/bi08/*`, `tests/bi08_idempotent_ingress.test.ts`; tree verified | **CONVERGED / VERIFIED** |
| 3 | **D7 engine lineage** | not identified | — | — | — | — | `D7` exists only as an NP-12 decision item | **UNKNOWN / REQUIRES AUTHORITY** |
| 4 | **Sector engine set** | IES-006…020 / D42 | **IRR** `iips-platform/src/sector-engines/*` (13, `sector.*`) **and** **IPD** `src/engine_adapters/frozen_engines.ts` (13 + `CSIP_COMPOSITE`) | **NO** | not declared | **YES** | IRR `EngineRegistry.ts`; IPD `engine_adapters/types.ts`; IRR test forbids `sector.it`/`sector.chemicals` | **CONTRACT GAP** (out of NP-15 scope) |
| 5 | **Persistence** | G-2 (IRR, 2026-09-30) | two sibling IPD branches, neither on `main` | **NO** | substrate unprescribed (G-2 §3) | **YES** | `6828155` vs `2e11fa3`; +1,842/−8,184 | **GOVERNANCE GAP** — decided 2026-10-03, boundary pending |
| 6 | **Broker holdings / user portfolio** | BI-07/BI-08 | IPD `main`, frozen `8491efdc` | **YES** | distinct from IRR certified reference | No | G-2 §6; convergence plan §8 | **CONVERGED / VERIFIED** |
| 7 | **Portfolio (certified reference)** | Program v3.0 `/api/portfolio` | IRR — protected (G-2 §6) | n/a | **YES — protected** | No | G-2 §6, §8 | **SEPARATE BY DESIGN** |
| 8 | **Portfolio (historical full-IIPS)** | Phase 6 / N+8 | **NOT PORTED** — reference only | n/a | **YES — deliberate** | No | convergence plan §8 | **HISTORICAL / ARCHIVAL** |
| 9 | **Operator Drop** | P16-08 / AD-17 | IPD `main` `src/operator_drop/**` + `evidence/operator_drop/**` | **YES (IPD)** | **YES — G-2 §8 protects** | No | `src/operator_drop/index.ts`; identity-bypass record | **SEPARATE BY DESIGN** |
| 10 | **OIDC / Keycloak** | G3 / IRR `core/auth/**` | **IRR** G3 certified; **IPD** excluded, zero client auth | n/a | **YES — explicit** | **Latent** (Line A persistence adds OIDC verifier; `main` does not) | IRR `docs/v3.0/g3-build/**`; IPD grep 0 keycloak/oidc/authFetch | **SEPARATE BY DESIGN** |
| 11 | **IRR** | recovered workspace 2026-08-13 | IRR `main` `bb756c0` | baseline | **YES — separate repo** | **YES** (pin off-main; engines) | §4, §5.3 | **CONTRACT GAP** (out of NP-15 scope) |
| 12 | **IPD** | v1.0.0-rc1 / BI + full-IIPS | IPD `main` `4d3e1cd` **(3 unmerged heads)** | **NO — not one baseline** | — | **YES** | §5.2 | **GOVERNANCE GAP** (out of NP-15 scope) |
| 13 | **Reports** | donor `reports/Reports.tsx` | IPD `main` — `/reports` `unavailable`, fail-closed | structural only | **YES** | No | `navigation.ts` L183 | **SEPARATE BY DESIGN** |
| 14 | **Research** | donor UI03 + 6 children | IPD `main` — `/research` UI03 `partial`; 5 children `unavailable` | partial | **YES** | No | `navigation.ts` L113–123; PHASE-4 act | **SEPARATE BY DESIGN** |
| 15 | **Intelligence** | donor UI04 + Decision Matrix | IPD `main` — `/intelligence` UI04 `partial`; Decision Matrix `unavailable`; **M-1..M-5 OPEN** | **NO — functionality NOT complete** | **YES — deferred by authority** | No | Phase-1C Option B (`bc3fb80`, governance-only, zero code change); M-1..M-5 open | **SEPARATE BY DESIGN** — **PHASE-1C GOVERNANCE GATE CLOSED — DEFERRED COMPLETION AUTHORIZED (NOT functional completion)** |
| 16 | **Watchlists** | donor `watchlists/Watchlists.tsx` | IPD `main` — `unavailable` | structural only | **YES** | No | `navigation.ts` L184 | **SEPARATE BY DESIGN** |
| 17 | **Collaboration** | donor | IPD `main` — `unavailable` | structural only | **YES** | No | `navigation.ts` L182 | **SEPARATE BY DESIGN** |
| 18 | **Settings** | donor | IPD `main` — `unavailable` | structural only | **YES** | No | `navigation.ts` L185 | **SEPARATE BY DESIGN** |
| 19 | **Governed Screener** | donor `screener/GovernedScreener.tsx` | IPD `main` — `/screener/governed` `future` | **NO** | **YES** | No | `navigation.ts` L121–125 | **SEPARATE BY DESIGN** |
| 20 | **Evidence Landing / navigation** | NP-13 (IRR) | IRR — D0/D1 COMPLETE; D2 NOT ELIGIBLE | **NO** | **YES — IRR-only** | **YES** (stale `iips-platform` pin) | NP-13 series; GAP-05 | **GOVERNANCE GAP** |
| 21 | **Route protection** | IRR G3/OIDC + IPD D115 | **IRR** G3 certified; **IPD** no client auth, `/admin/*` = `AUTHORIZATION REQUIRED — D115 DEFERRED` | partial | **YES — D115 WITHHELD** | No (both fail closed) | `UnavailableSurface` states; OPTIONA §8, §11 | **SEPARATE BY DESIGN** |
| 22 | **PIT (market data)** | IU-1/2/3/5/6 | IPD `src/pit/**` (from `0dab1221`) + `src/d114/**` (frozen `0062ad52`); IRR via `PitReadPort` | **PARTIAL** | **YES — PIT must not be repurposed as portfolio persistence (G-2 §4)** | **YES** (pin off-main) | `ipdPitReadAdapter.ts` | **CONTRACT GAP** (out of NP-15 scope) |
| 23 | **IU-7** | — | **NO ARTIFACT, NO COMMIT IN EITHER REPO** | — | — | — | §3.5 — only 2 mentions inside G-2 §8 | **EVIDENCE GAP** |
| 24 | **D114 historical** | Stage-4/5 | IPD `main`, frozen `0062ad52` | **YES** | **YES — frozen, excluded** | No | convergence plan §13 | **SEPARATE BY DESIGN** |
| 25 | **Identity / SecurityMaster** | D05 broad universe (2,250) | IPD `main`, frozen `9080e997` | **YES (IPD)** | `companyId` sole authority; FIGI deferred | **Latent** | convergence plan §12; `PHASE1…PREPARATION.md` §G | **SEPARATE BY DESIGN** |
| 26 | **NP-12 Governed Screener / Screen Definition** | NP-12 N4 | IRR `bb756c0` — N4-SD, N4-A10, N4-A13, certification | **YES** | **YES — IRR-only** | No | `IIPS_NP-12_N4_SCREEN_CERTIFICATION.md`; PRs #8–#27 | **CONVERGED / VERIFIED** |
| 27 | **`798bc548` (lost shell)** | — | **NOT RECOVERED** | n/a | n/a | No | `REMOTE-DURABILITY-BLOCKED-REPORT.md` | **HISTORICAL / ARCHIVAL** |

---

## 9. Contract Reconciliation

### 9.1 Compatible contracts

| Contract | IRR | IPD | Status |
|---|---|---|---|
| PIT read (`PitReadPort` ↔ `PitReadService.queryAsOf`) | `pitReadContract.ts`, `pitReadPort.ts`, `ipdPitReadAdapter.ts` | `src/pit/pit_read_service.ts`, `src/pit/pit_store.ts` | **COMPATIBLE** — six provenance fields projected 1:1, fail-closed, typed miss reasons surfaced unchanged; installed pin exposes `dist/package/pit` |
| PIT not used as portfolio persistence | G-2 §4 | G-2 §4 | **COMPATIBLE** |
| Broker ingestion authority | G-2 §2 (reuse, do not reimplement) | BI-03..BI-08 on `main` | **COMPATIBLE** |
| Certified reference vs user portfolio | G-2 §6 | convergence plan §8 (frozen `8491efdc`) | **COMPATIBLE** |
| React version | 18.3.1 | 18.3.1 | **COMPATIBLE** |
| `react-router-dom` | ^6.28.0 | ^6.30.6 | **COMPATIBLE** (minor range drift) |
| Production fail-closed | 0 providers / 0 sockets | n/a | **COMPATIBLE** |
| D114 frozen | frozen tree | `0062ad52` | **COMPATIBLE** |

### 9.2 Additive contracts

`./d114-non-production` export (from `0dab1221`) · `./persistence` export (`2e11fa3` only) ·
`unavailable` nav status (Phase 5 Option A) · `/api/ipd/*` HTTP surface (`6828155` only).

### 9.3 Conflicting contracts — 5, none resolved by this record

| # | Contract | Side A | Side B | Nature |
|---|---|---|---|---|
| **C-1** | **Package export surface** | IPD `main`: **no `exports` map** | IRR requires `iips-production-market-data/pit`; satisfied only by `0dab1221` | **HARD BREAK.** IRR cannot build against IPD `main`. *Out of NP-15 scope.* |
| **C-2** | **Persistence ownership & substrate** | Line A `6828155`: `better-sqlite3@13.0.3`, `/api/ipd/*`, OIDC verifier, `tenant_memberships`, schema `002` | Line B `2e11fa3`: Node `node:sqlite`, `GovernedArtifactStore`, report supersession, no HTTP/OIDC | **MUTUALLY EXCLUSIVE.** Overlapping `src/persistence/{errors,index}.ts` differ. *Decided 2026-10-03: both, boundary pending.* |
| **C-3** | **Engine taxonomy** | IRR: 13 engines `sector.banking … sector.materials`; transport test **forbids** `sector.it`, `sector.chemicals`, `sector.realty` | IPD: `SECTOR_IT, SECTOR_BANKING, SECTOR_AUTO, SECTOR_PHARMA, SECTOR_FMCG, SECTOR_METALS, SECTOR_OIL_GAS, SECTOR_POWER, SECTOR_CEMENT, SECTOR_TELECOM, SECTOR_CONSUMER_DURABLES, SECTOR_CAPITAL_GOODS, SECTOR_CHEMICALS, CSIP_COMPOSITE` | **DIRECT CONTRADICTION.** *Out of NP-15 scope.* |
| **C-4** | **Tenant / principal mapping** | D115 WITHHELD; `tenant_memberships` has 0 non-test callers, 0 endpoints, 0 guards; `tenantId` has no upstream source | IRR G3 `principal-tenant-mapping.md` | **UNRESOLVED BY DESIGN.** NP04 G31: tenant source of truth = D115-deferred; administration NOT AUTHORIZED. |
| **C-5** | **Identity authority** | IPD `SecurityMaster` / `companyId` (`EQ_AGI_IN`) — **sole authority** | Historical full-IIPS `canonicalSecurityId` / **FIGI authoritative** (XI-1) | **UNRESOLVED BY DESIGN.** Both fail closed; convergence plan §12 forbids silent reconciliation. |

### 9.4 Duplicate contracts / implementations

**D-1** persistence (unresolved → decided, boundary pending) · **D-2** sector scoring engines
(conflicting taxonomy, out of scope) · **D-3** portfolio workspace (**not** a duplicate — three
distinct semantics, each a recorded authority decision) · **D-4** broker-import contracts (**not**
a duplicate — ancestor/descendant; `01a0bdb5` is PRIOR CONVERGENCE PRECEDENT, not a merge
candidate) · **D-5** "IPD" identifier (**resolved 2026-10-03**).

### 9.5 Unresolved contracts

Durable portfolio IRR consumption boundary (G-2 §5) · governed Intelligence payload (M-1..M-5) ·
Executive portfolio-level payload (X-1..X-5) + granularity divergence · Evidence (E-1..E-5) and
Research (R-1/R-5/R-6) payloads · seven Executive widgets with **zero repository evidence** ·
`82 + 66 = 148` (Windows-only) · tenant lifecycle / audit / cross-system security audit ·
**IU-7 scope and outcome** (GAP-15).

---

## 10. Authority & Durability Assessment

### 10.1 The eight durability checks, applied to every material claim

Legend: **DA** durable artifact · **LO** location · **AR** authoritative repo · **RF** ref known ·
**CV** commit remotely verified · **CU** artifact current · **AD** authority decision durably
recorded · **GD** governance authority distinct from implementation authority.

| Claim | DA | LO | AR | RF | CV | CU | AD | GD | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| IPD `main` = `4d3e1cd` | Y | IPD | Y | `main` | Y | Y | n/a | n/a | **DURABLE** |
| IPD tests 542/542, tsc PASS | P | IPD | Y | `main` | Y | Y | n/a | n/a | **VERIFIED (re-executed)** |
| IPD frozen trees (4) | Y | IPD | Y | `main` | Y | Y | n/a | n/a | **DURABLE** |
| `0dab1221` not on IPD `main` | Y | IPD | Y | `main` vs branches | Y | Y | n/a | n/a | **DURABLE** |
| Persistence lineages are siblings | Y | IPD | Y | 2 branches | Y | Y | n/a | n/a | **DURABLE** |
| Line B has no governance record | Y | IPD | N (`np04-…windows`, non-authoritative) | Y | Y | Y | **N** | n/a | **DURABLE FACT — NON-AUTHORITATIVE LOCATION** |
| NP04-G24 recorded | Y | IPD | **N** (`arena/01a0f308`) | Y | Y | Y | **N** | n/a | **DURABLE — NON-AUTHORITATIVE REF** |
| IRR `main` = `bb756c0` | Y | IRR | Y | `main` | Y | Y | n/a | n/a | **DURABLE** |
| IRR HEAD RED (2 failures) | P | IRR | Y | `main` | Y | Y | n/a | n/a | **VERIFIED; attribution UNRESOLVED** |
| IRR IPD pin = `0dab1221` | Y | IRR | Y | `main` | Y | Y | n/a | n/a | **DURABLE** |
| NP-13 D1 COMPLETE / D2 NOT ELIGIBLE | Y | IRR | Y | `main` | Y | Y | **Y** (`c6ac439`, `56aaad1`) | **Y** | **DURABLE** |
| G-2 architectural decision | Y | IRR | Y | `main` | Y | Y | **Y** (`b7ed35e`) | **Y** | **DURABLE (governance only)** |
| OQ-1 = A, OQ-2 = `c440` | Y | IPD | Y | `main` | Y | Y | **N** (recorded in source header only) | n/a | **DURABLE FACT — DECISION ACT NOT SEPARATELY PUBLISHED** |
| NP-01…NP-11, NP-14 status | **N** | — | — | — | — | — | — | — | **EVIDENCE GAP** |
| IU-7 | **N** | — | — | — | — | — | — | — | **EVIDENCE GAP** |
| NP-15 definition | **N** | — | — | — | — | — | — | — | **NOT DURABLE** |
| The 2026-10-03 decisions (§18) | **N** | chat | — | — | — | — | — | — | **NOT DURABLE** |
| **This record** | **N** | IRR working tree, uncommitted | — | — | — | — | — | — | **NOT DURABLE** |

### 10.2 Implementation authority vs governance authority

* **Governance authority exercised:** investigation, classification, gap registration,
  recommendation — derived solely from the NP-15 prompt plus the four Program Authority decisions
  at §18.
* **Implementation authority:** **NOT GRANTED** by the NP-15 prompt (§0, §20) and **NOT CLAIMED**.
* **No inference** drawn from prior implementation (32 IRR PRs, 6 IPD PRs), repository access,
  user ownership, or prior qualifications (E2E-030, Track 8, v1.1/v1.2 LTS, BI-07, P13–P17,
  NP-12 N4).
* **Acceptance/certification authority** for a Broad IPD Phase 1 convergence statement is
  **NOT ESTABLISHED** in any artifact (GAP-01). This survives the scope binding: the declaration
  must name who declares.

### 10.3 Durability failure modes — five documented occurrences

| # | Occurrence | Outcome |
|---|---|---|
| 1 | `798bc548` | **permanently lost** — `REMOTE-DURABILITY-BLOCKED-REPORT.md` |
| 2 | IPD sandbox re-clone (A) | survived only because pushed |
| 3 | IPD sandbox re-clone (B, C) | survived only because pushed — `BI08-MASTER-…RECONCILIATION.md` §0, `NEXT-PRODUCT-SURFACE…PACKET.md` §0 |
| 4 | **This investigation, 2026-10-03 (first)** | IPD scratch clone **and** report v1.0 destroyed between turns |
| 5 | **This investigation, 2026-10-03 (second)** | report v1.1 destroyed between turns — reconstruction required |

> **Empirical finding.** Across five occurrences, **only content inside a Git repository survived.**
> Content written to the Arena workspace outside a repository was destroyed **every time**. This is
> why this record is now placed inside the IRR working tree — and why a commit + push + independent
> remote verification remain mandatory before anything here is described as durable.

---

## 11. NP-01–NP-14 Reconciliation

**Method.** Latest authoritative evidence only: IRR `main` `bb756c0` working tree, IRR commit
history via GitHub API (100 most recent), IRR 32 PRs / 32 issues, IPD full history and 6 PRs.
Where a tracker exists, it is not relied on alone.

| Work item | Earlier status | Later / current status | Superseding evidence | Reconciled status |
|---|---|---|---|---|
| **NP-01** | unknown | **UNKNOWN** | no artifact; no PR; no issue | **UNKNOWN** |
| **NP-02** | unknown | **UNKNOWN** | same | **UNKNOWN** |
| **NP-03** | unknown | **UNKNOWN** | same | **UNKNOWN** |
| **NP-04** *(IRR namespace)* | unknown | **UNKNOWN** | no IRR artifact | **UNKNOWN** |
| **NP-04 / NP04** *(IPD namespace — distinct)* | G22 accepted direction | **G24 IMPLEMENTATION COMPLETE; follow-up governance remains** | `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md` @ `6828155`; G29/G30/G31 all NONE-mutation | **COMPLETED / CLOSED (implementation) — GOVERNANCE OPEN**; both lines retained per 2026-10-03 decision |
| **NP-05** | unknown | **UNKNOWN** | no artifact | **UNKNOWN** |
| **NP-06** | unknown | **UNKNOWN** | no artifact | **UNKNOWN** |
| **NP-07** | unknown | **UNKNOWN** | no artifact | **UNKNOWN** |
| **NP-08** | unknown | **UNKNOWN** | no artifact | **UNKNOWN** |
| **NP-09** | cited as precedent | **UNKNOWN (cited, not present)** | `NP-13-D0-01` §1.2 cites `NP-09-AUTH-01`; **no file exists** | **UNKNOWN — EVIDENCE GAP** |
| **NP-10** | cited as precedent | **UNKNOWN (cited, not present)** | `NP-13-D0-01` §1.2 cites `NP-10-AUTH-01`; no file | **UNKNOWN — EVIDENCE GAP** |
| **NP-11** | cited as precedent | **UNKNOWN (cited, not present)** | `NP-13-D0-01` §1.2 cites `NP-11-AUTH-01`, `NP-11-D1`; no file | **UNKNOWN — EVIDENCE GAP** |
| **NP-12** | readiness gate → authority → implementation | **N4 Screen Definition IMPLEMENTED + CERTIFIED** | PRs #8–#27; `IIPS_NP-12_N4_SCREEN_CERTIFICATION.md`; `N4-A13-IMPLEMENTATION-RECORD.md`; `A8-S-03` failed-branch decision | **NON-PRODUCTION QUALIFIED / CERTIFIED** (envelope: N4-SD + N4-A10 + N4-A13 only; per `D-N4-CERT-03`). `A6-IMPL-10` confirmed open. |
| **NP-13** | D0 → D1-A → D1-B → D1-C unresolved | **D1 COMPLETE (condition-satisfaction only) · D1-C 10/10 RESOLVED · D2 DEFINITION ESTABLISHED (PR #33) · D2 ELIGIBILITY NOT DETERMINED · D2 WORK NOT STARTED · D3 NOT ELIGIBLE · implementation NOT AUTHORIZED** | `NP-13-PA-D1-COMPLETION-01` @ `c6ac439` (13:03Z); `NP-13-PA-D2-DECISION-01` @ `56aaad1` (13:16Z); **`NP-13-D2-01-DEFINITION-01` @ `c3ff9125f` / merge `8ca99ee1` (14:15Z) — landed during NP-15** | **OPEN** — D0/D1 closed; D2 definition established but D2-A/B/C undecided and no ref bound; D3 not eligible |
| **NP-14** | — | **UNKNOWN** | no artifact, no PR, no issue, zero hits | **UNKNOWN — EVIDENCE GAP** |

**Cross-namespace warning.** `NP-04` in IPD is **not** `NP-04` in IRR's NP series. IPD uses
`P01…P17`, `BI-01…BI-08`, `IU-1…IU-8`, `NP04`, `F-3/F-8/F-9`, `D05/D36/D38/D41/D42/D88/D91/D114/D115`,
`E2E-0xx`, `WS-*`; IRR uses `NP-12/NP-13`, `IU-5/6/7/8`, `G-2/G-3`, `IES-0xx`, `D42`, `E2E-0xx`.

---

## 12. NP-13 Dependency Assessment

> **NP-13 is INDEPENDENT of NP-15 at the definitional and decisional level, with a
> forward-looking SOFT dependency and one live CONFLICT to disclose.**

| Axis | Finding | Evidence |
|---|---|---|
| Scope overlap | **NP-13 places IPD explicitly OUT OF SCOPE in every authority record.** | `NP-13-D0-01` header: "IPD: OUT OF SCOPE for this gate — not accessed, not referenced as authority, 0 mutations". `NP-13-PA-D1-COMPLETION-01` §1.5. `NP-13-PA-D2-DECISION-01`. `NP-13-GO3B-DECISION-01` §12.3.2: "IPD mutations this session — NONE — ZERO". |
| Ref binding | **NP-13 binds no repository/ref.** D1-A selected G-O-3 = baseline object **+ explicitly bound repository/ref identity**, but D1-B supplies **component (a) only**. | `NP-13-D1-01` §2.3; D1-B §3.1 text: the governed object "is distinct from any repository, branch, commit, implementation artifact, runtime realization, or individual workstream record". |
| Completion state | D0/D1 complete (governance only). **D2 definition ESTABLISHED (PR #33, 2026-10-03T14:15:06Z) — but D2-A/B/C undecided, D2 eligibility NOT DETERMINED, D2 work NOT STARTED, no ref bound, IPD out of scope.** D3 not eligible. Implementation not authorized. | `NP-13-PA-D1-COMPLETION-01`; `NP-13-PA-D2-DECISION-01`; **`NP-13-D2-01-DEFINITION-01`** |
| Can NP-15 decide without NP-13? | **YES.** | §5, §6, §7 |
| Forward soft dependency | NP-13 **D2** will define **composition and membership** of the IRR active non-production feature baseline. If IPD components become members, D2's ref-binding act will need an IPD coordinate. | `NP-13-D0-01` §1.3 (J-2, J-3); `NP-13-PA-D2-DECISION-01` |
| **Live conflict** | `NP-13-D1-PREREQ-01 §7.1` pins *"IPD (`iips-platform`) tree"* = `27104015…`; the tree at IRR HEAD is **`001b1e3f…`**. **STALE.** | `git rev-parse bb756c040:iips-platform`; GitHub API tree lookups at 8 commits |
| Disclosed, unresolved | NP-13 records the repository-vs-directory labelling variance and **carries it forward unresolved**. | `NP-13-GO3B-DECISION-01` §12.3.4 |

### 12.3 Exact portion of NP-13 that remains open

```text
D0  ESTABLISHED ................................ CLOSED (jurisdiction designated only)
D1-A G-O-3 SELECTED ............................ CLOSED
D1-B definition supplied (540 B, SHA 29f2d5f6…)  CLOSED
D1-C #1–#10 = A / RESOLVED ..................... CLOSED
D1  = COMPLETE (condition-satisfaction only) ... CLOSED (13:03Z, 2026-10-03)
D1 ACCEPTANCE .................................. NO SEPARATE ACCEPTANCE STATE
G-O-3(b) ref binding ........................... NOT SUPPLIED — OPEN
D2  ............................................ DEFINITION ESTABLISHED · ELIGIBILITY = ELIGIBLE ·
                                                 D2-A/B/C DEFINED / NOT DECIDED ·
                                                 SUB-GATE CONVENING AUTHORITY GRANTED ·
                                                 WORK NOT STARTED · NO REF BOUND
      ← UPDATED TWICE 2026-10-03 at the declaration gate.
        (a) PR #33 (c3ff9125f, merge 8ca99ee1, 14:15:06Z) published
            NP-13-D2-01-DEFINITION-01.md — established the D2 definition
            (D2-A nature / D2-B binding+evidence / D2-C realization+durability).
        (b) 79483c8 published NP-13-PA-D2-ELIGIBILITY-01.md —
            "PA-D2-ELIG-01 = A — DECLARE D2 ELIGIBLE";
            "PA-D2-AUTH-01 = A — AUTHORIZE CONVENING OF D2-A / D2-B / D2-C SUB-GATES";
            "PA-D2-ORD-01 = A — NO MANDATORY ORDERING IMPOSED".
        Per (b): "D2-A = DEFINED / NOT DECIDED · D2-B = DEFINED / NOT DECIDED ·
                  D2-C = DEFINED / NOT DECIDED · D2 WORK = NOT STARTED ·
                  IMPLEMENTATION AUTHORITY = NOT GRANTED · D3 = NOT ELIGIBLE".
        BOTH records place IPD "OUT OF SCOPE — NOT ACCESSED / NOT MODIFIED", and (b) expressly
        does NOT "perform the concrete E-3 operational-ref binding act or designate an initial
        authoritative evidence coordinate".
        → Does NOT block NP-15. Forward soft dependency: D2-B will perform the E-3 binding;
          if IPD becomes a baseline member, D2-B will need an IPD coordinate.
D3  ............................................ NOT ELIGIBLE
implementationAuthority ........................ NOT GRANTED
IRR feature-baseline membership ................ NOT DETERMINED
NP-12 inclusion/exclusion ...................... NOT DETERMINED (NP-13-D0-01 §3.10)
```

**Effect on NP-15: none of the open portion blocks a narrow Phase-1 convergence declaration.**

---

## 13. Convergence Gap Register

| Gap ID | Area | Description | Severity | Evidence | Dependency | Governance or Implementation? | Current authority | Recommended next gate |
|---|---|---|---|---|---|---|---|---|
| **GAP-01** | Authority | **No artifact defines who may declare Broad IPD Phase 1 converged**, or what evidence a declaration requires. *(Scope half resolved 2026-10-03; acceptance-authority half open.)* | **CRITICAL** | zero `NP-15` hits; `NP-13-GO3B-DECISION-01` §12.3.4 | none | **Governance** | **NOT ESTABLISHED** | **NP-15 CONVERGENCE DECLARATION ACT** |
| **GAP-02** | Dependency | **IRR's IPD pin (`0dab1221`) is not on IPD `main`**; IPD `main` has **no `exports` map**. IRR cannot build against IPD `main`. *Out of NP-15 scope.* | **CRITICAL** | `frontend/package.json`, `package-lock.json`; `git show origin/main:package.json`; `git merge-base --is-ancestor` | GAP-03 | **Governance** | **NOT GRANTED** | IRR↔IPD pin reconciliation gate |
| **GAP-03** | Baseline | **IPD has three unmerged heads** plus the off-main pin. No act designates one as authoritative for the external repository. *Out of NP-15 scope; term ambiguity resolved.* | **CRITICAL** | §5.2 ancestry matrix | D-NP15-2 | **Governance** | **NOT GRANTED** | Ref-designation act |
| **GAP-04** | Persistence | **Two mutually exclusive persistence implementations** (50 files, +1,842/−8,184); conflicting `src/persistence/{errors,index}.ts`; Line B has no governance record. **DECIDED 2026-10-03: both retained.** **Boundary not yet written.** | **HIGH** | `git diff --stat 6828155 2e11fa3`; NP04 record §4.2, §10 | D-NP15-4 | **Governance** (write the boundary) | G24 authorized on non-main ref; NP-04 line **no authority found** | **PERSISTENCE DOMAIN-BOUNDARY ACT** |
| **GAP-05** | Stale pin | `NP-13-D1-PREREQ-01 §7.1` pins `iips-platform` at `27104015…`; HEAD is `001b1e3f…`. Moved three times, driven by NP-12 N4 mutations. | **MEDIUM** | GitHub API tree lookups at 8 commits | NP-13 D2 | **Governance** | NP-13 D0/D1 hold the pin | Rebinding act (fold into NP-13 D2-01) |
| **GAP-06** | Engines | **Incompatible certified engine taxonomies.** IRR forbids `sector.it`/`sector.chemicals`; IPD certifies `SECTOR_IT`/`SECTOR_CHEMICALS` + `CSIP_COMPOSITE`. *Out of NP-15 scope.* | **HIGH** | IRR `EngineRegistry.ts`; IPD `engine_adapters/types.ts`; `product-transport.test.ts` L269–276 | D-NP15-5 | **Governance** | **NOT ESTABLISHED** | Engine-taxonomy jurisdiction act |
| **GAP-07** | Verification | **IRR HEAD is RED:** 2 failed / 272 passed / 25 skipped; `tsc --noEmit` PASSes. Attribution unresolved. *Out of NP-15 scope.* | **MEDIUM–HIGH** | `vitest run`; `executive-transport.ts:297`; `pitRuntimeIntegration.test.ts` L359–362 | none | **Governance first**, then implementation only if a defect is declared | **NOT GRANTED** | IRR HEAD red-state disposition |
| **GAP-08** | Evidence | **No durable artifact for NP-01…NP-11 or NP-14.** NP-09/10/11 cited as precedent inside NP-13-D0-01 but no file exists. | **MEDIUM** | `git ls-files`; API tree listings | none | **Governance / evidence** | n/a | Supply artifacts or record as NOT DURABLE |
| **GAP-09** | Scope | **"IPD Phase 1" had two authored definitions plus an undocumented Phase 1C plus a conflicting second numbering.** | **MEDIUM** | convergence plan §15; `PHASE1…PREPARATION.md` §L; Phase-1C record; OPTIONA result §4 | **RESOLVED by D-NP15-1**, §18.4 outstanding | **Governance** | **GRANTED 2026-10-03** | §18.4 confirmation |
| **GAP-10** | Identity | FIGI-authoritative vs `companyId`-authoritative conflict unresolved by design; both fail closed. | **LOW (latent HIGH if scope expands)** | convergence plan §12; `PHASE1…PREPARATION.md` §G | none | **Governance** | deferred by explicit record | Identity Authority Decision |
| **GAP-11** | Tenancy | Tenant source of truth D115-deferred; administration NOT AUTHORIZED; `tenant_memberships` 0 callers / 0 endpoints / 0 guards; `tenantId` no upstream source; implicit `REVOKED → ACTIVE` recorded as **not** approved policy. | **MEDIUM (latent)** | NP04 record §4.4, §5, §7, §9 | D115 disposition | **Governance** | D115 WITHHELD | D115 disposition |
| **GAP-12** | Durability | **This record and the 2026-10-03 decisions are not durable.** The workspace was re-provisioned twice mid-investigation and destroyed both report v1.0 and v1.1, and the IPD scratch clone. Only repository content survived. | **HIGH** | §10.3 occurrences 4 and 5 | D-NP15-7 | **Governance** | destination chosen; **commit/push authority NOT GRANTED** | **Publication act + explicit commit/push authorization** |
| **GAP-13** | Evidence | Windows-only acceptance criteria not claimable by Arena: `82 + 66 = 148`; 7 Executive widgets with zero repository evidence. Phase-8 Windows gate never held. | **MEDIUM** | convergence plan §11.1; inventory §4 K | Windows host | **Evidence** | n/a | Phase-8 Windows acceptance gate |
| **GAP-14** | Terminology | **`B1 platform baseline` and `D7 engine lineage`** are not durable workstream identifiers in either repository. | **LOW** | grep across both repos | none | **Governance / evidence** | n/a | Confirm or withdraw in the scope act |
| **GAP-15** | Evidence | **IU-7 is not reconstructable.** Required by the NP-15 brief; **2 mentions only** (both inside G-2 §8), **0 artifacts, 0 commits, 0 PRs** in either repository. | **MEDIUM** | §3.5 search table | none | **Evidence** | n/a | Supply IU-7 evidence or record as NOT RECONSTRUCTABLE |

---

## 14. Evidence / Verification Matrix

| # | Assertion | Repo | Ref | Commit | Verification performed | Result |
|---|---|---|---|---|---|---|
| E-01 | IRR HEAD / parity | IRR | `main` | `bb756c04…` | `git rev-parse HEAD`, `git ls-remote origin HEAD` | **VERIFIED — parity** |
| E-02 | IRR worktree clean | IRR | `main` | `bb756c04…` | `git status --short` (before and after) | **VERIFIED — CLEAN** |
| E-03 | IRR typecheck | IRR | `main` | `bb756c04…` | `./node_modules/.bin/tsc --noEmit` | **PASS (exit 0)** |
| E-04 | IRR tests | IRR | `main` | `bb756c04…` | `npx vitest run` | **2 failed / 272 passed / 25 skipped (299)** |
| E-05 | IRR IPD pin content | IRR | `main` | `bb756c04…` | lockfile + `node_modules/…/dist/package` listing | **VERIFIED — `/pit` present at pin** |
| E-06 | IPD HEAD / parity | IPD | `main` | `4d3e1cdc…` | `git rev-parse HEAD`, `git ls-remote` | **VERIFIED — parity** |
| E-07 | IPD worktree clean | IPD | `main` | `4d3e1cdc…` | `git status --short` | **VERIFIED — CLEAN** |
| E-08 | IPD typecheck | IPD | `main` | `4d3e1cdc…` | `npm run build:tsc` | **PASS** |
| E-09 | IPD tests | IPD | `main` | `4d3e1cdc…` | `npm test` | **542 pass / 0 fail / 83 suites** |
| E-10 | IPD frozen trees | IPD | `main` | `4d3e1cdc…` | `git rev-parse <ref>:<path>` | **VERIFIED** `8491efdc` / `9080e997` / `0062ad52` / `1597ed06` |
| E-11 | IPD `main` has no exports map | IPD | `main` | `4d3e1cdc…` | `git show origin/main:package.json` | **VERIFIED — `exports: null`** |
| E-12 | `0dab1221` not on IPD main | IPD | `main` vs branches | — | `git merge-base --is-ancestor` | **VERIFIED — FALSE** |
| E-13 | Persistence lineages are siblings | IPD | 2 branches | `6828155`, `2e11fa3` | `git merge-base` → `246cb944…` | **VERIFIED** |
| E-14 | Persistence divergence size | IPD | — | `6828155` → `2e11fa3` | `git diff --stat` | **VERIFIED — 50 files, +1,842 / −8,184** |
| E-15 | Line B has no governance record | IPD | `np04-…windows` | `2e11fa3` | `git ls-tree -r` + grep | **VERIFIED — none** |
| E-16 | NP04-G24 governance record exists | IPD | `arena/01a0f308-…` | `6828155` | `git show …:path` | **VERIFIED (415 lines)** |
| E-17 | Engine taxonomy conflict | IRR + IPD | `main`/`main` | `bb756c04…`/`4d3e1cdc…` | `EngineRegistry.ts` vs `engine_adapters/types.ts` | **VERIFIED — disjoint** |
| E-18 | `iips-platform` tree drift | IRR | `main` | 8 commits | GitHub API tree lookups | **VERIFIED — `0004da6f` → `27104015` → `c5af3fe2` → `001b1e3f`** |
| E-19 | OQ-1/OQ-2 resolved | IPD | `main` | `4d3e1cdc…` | `routes.ts` header | **VERIFIED — "OQ-1 = Option A, OQ-2 = c440"** |
| E-20 | Route/nav census | IPD | `main` | `4d3e1cdc…` | `navigation.ts` status grep | **VERIFIED — 2 / 6 / 20 / 5** |
| E-21 | No `NP-15` anywhere | IRR + IPD | all | all | grep + GitHub API | **VERIFIED — zero hits** |
| E-22 | No NP-01…NP-11 / NP-14 artifact | IRR + IPD | `main` + 3 commits | — | `git ls-files`, API trees | **VERIFIED — absent** |
| E-23 | NP-13 IPD out-of-scope | IRR | `main` | `bb756c04…` | 5 NP-13 records read | **VERIFIED** |
| E-24 | NP-13 binds no ref | IRR | `main` | `bb756c04…` | `NP-13-D1-01` §2.3, §3.5 | **VERIFIED** |
| E-25 | IPD `main` has no client-side auth | IPD | `main` | `4d3e1cdc…` | OPTIONA §13 guard tests OPTA-10/11 | **VERIFIED by prior record — not re-executed** |
| E-26 | Phase-1B discrepancy root cause | IPD | `main` | `4096276` manifest | `gh api .../contents/...?ref=main` | **VERIFIED — Windows stale-`dist/` measurement defect; visual acceptance ACCEPTED** |
| E-27 | IU-7 has no durable evidence | IRR + IPD | all | all | grep + IRR/IPD commit + PR/issue search | **VERIFIED — 2 mentions, 0 artifacts, 0 commits** |

**Not verified (honest disclosure):**
* IRR `vite build` — **not run**.
* IRR failure **attribution** — **not determined** (shallow clone prevents bisection).
* IPD `vite build` — **not run** (`build:tsc` was run; `tsc` is the typecheck half of IPD's `build`).
* Windows visual acceptance (`82+66=148`, 7 Executive widgets) — **not verifiable** from either repo.
* Live Keycloak verification — corpus records it as environment-dependent outstanding; not performed.
* The IPD tracker `.xlsx` was **not decoded** (binary OOXML); reconciliation used source artifacts
  and GitHub metadata, per §13's instruction not to rely solely on a tracker.

---

## 15. NP-15 Readiness Determination

### 15.1 Convergence conditions

| # | Condition | Source | Unbound scope | **Narrow bound scope** |
|---|---|---|---|---|
| K-01 | One authoritative baseline | NP-13 D0/D1; plan §16; AC-18 | ❌ FAIL | ✅ **PASS** — IPD `main@4d3e1cd` |
| K-02 | Coherent package/contract surface | `ipdPitReadAdapter.ts` prerequisite | ❌ FAIL | ➖ **OUT OF SCOPE** |
| K-03 | No duplicate active implementations | plan §5.1, §8 | ❌ FAIL | ✅ **PASS** — one shell at `main`; donor archival |
| K-04 | Conflicts resolved or explicitly deferred by authority | plan §12 | ⚠️ PARTIAL | ✅ **PASS** — Phase-1C deferral is an authority act |
| K-05 | Protected foundations frozen and verified | G-2 §8; OPTIONA §17 | ✅ PASS | ✅ **PASS** |
| K-06 | Tests / typecheck / build pass at declared baseline | plan §19 | ❌ FAIL (IRR red) | ✅ **PASS** — IPD 542/542, tsc PASS |
| K-07 | Worktree clean; `local == remote` | plan §16 | ✅ PASS | ✅ **PASS** |
| K-08 | Production fail-closed | AC-13/14/16 | ✅ PASS | ✅ **PASS** |
| K-09 | Route protection / honest fail-closed states | OPTIONA §8 | ✅ PASS | ✅ **PASS** |
| K-10 | Restart/durability verification | G-2 §3 | ❌ FAIL/UNRESOLVED | ➖ **OUT OF SCOPE** |
| K-11 | Windows / operator acceptance | plan §15 Phase 8 | ❌ NOT HELD | ⚠️ **PARTIAL — HONESTLY RECORDED.** Phase-1B visual-evidence intake **ACCEPTED WITH RECORDED DISCREPANCY** (§3.4); broader **Phase-8 Windows acceptance NOT HELD**. The accepted Phase-1B evidence is **not** converted into a claim that the complete Phase-8 condition passed. `82+66=148` and 7 Executive widgets remain **NOT CLAIMABLE**. |
| K-12 | Durable authority record of the convergence decision | NP-13 D0 §1.2; F-8 invariant | ❌ FAIL | ❌ **FAIL** — produced *by* the declaration gate |
| K-13 | Acceptance authority identified | NP-12 `D-N4-CERT-03` | ❌ FAIL | ❌ **FAIL** — produced *by* the declaration gate |

### 15.2 Determination A — before the scope binding (superseded, retained for history)

> ## **C — GOVERNANCE GAP REMAINS**
>
> With no bound scope, the convergence question could not be decided: no act defined *Broad IPD
> Phase 1*, none designated the authoritative IPD ref, none disposed the persistence lineages, none
> adjudicated the engine taxonomy, and no artifact identified who may declare convergence.
> **Secondary:** **D — EVIDENCE GAP REMAINS** for NP-01–NP-11/NP-14 (GAP-08), IU-7 (GAP-15) and
> Windows acceptance (GAP-13).

### 15.3 Determination B — after the 2026-10-03 scope binding (**CURRENT**)

> ## **A — READY FOR CONVERGENCE DECLARATION**
>
> *(This state means the gate **may be held**. It is **not** the declaration. No convergence is
> claimed before the formal declaration act — see §17 and D-NP15-9/D-NP15-10.)*
>
> **Reading rule.** Each row below separates **(1) historical execution · (2) current IPD `main`
> state · (3) Phase-5 supersession · (4) declaration relationship.** The record does not collapse
> them.
>
> | Element | (1) Historical execution | (2) Current IPD `main` | (3) Phase-5 supersession | (4) Declaration relationship |
> |---|---|---|---|---|
> | **Phase 1A** — shell (9 files) | **VERIFIED at `f13002e`** (13 routes, 2 implemented / 11 future) | `routes.ts`, `navigation.ts`, `AppShell.tsx` **modified**; 36 routes, 32 nav | **SUPERSEDED** | **DECLARATION TARGET PENDING D-NP15-9** — see §6.4 |
> | **Phase 1A** — presentation kit (11) | **VERIFIED at `f13002e`** | `components/**` unmodified | **NOT SUPERSEDED** | **Converged — target unambiguous** |
> | **Phase 1A** — `FeaturePlaceholder` | **VERIFIED at `f13002e`** | unmodified | **NOT SUPERSEDED** | **Converged — target unambiguous** |
> | **Phase 1B** — BI-08 mount at `/portfolio` | **VERIFIED at `144e8ed`** | `/portfolio` = `implemented`; BI tree frozen `8491efdc` **UNCHANGED**; 1B test modified but passing | **MOUNT PRESERVED** | **Converged — target unambiguous** |
> | **Phase 1B** — Windows visual acceptance | Gate at `4096276` manifest | **ACCEPTED WITH RECORDED DISCREPANCY** | n/a | **ACCEPTED, Phase-1B scope only — NOT a Phase-8 Windows acceptance** (§6) |
> | **Phase 1C** — Intelligence | **Governance-only at `bc3fb80`** (zero code change) | `/intelligence` (UI04) = **`partial`**; Decision Matrix `unavailable`; **M-1..M-5 OPEN** | n/a | **PHASE-1C GOVERNANCE GATE CLOSED — DEFERRED COMPLETION AUTHORIZED. Intelligence functionality NOT complete.** |
> | **Baseline** | — | IPD `main@4d3e1cd` — **542/542 tests, 83 suites, tsc PASS, worktree clean, `local == remote`** *(MEASURED, not designated — §5 caveat 1)* | — | Declared **against** this measured baseline |
> | **Protected foundations** | — | `8491efdc` / `9080e997` / `0062ad52` / `1597ed06` — verified intact | — | No change |
> | **OQ-1 / OQ-2** | — | Resolved as recommended; recorded in `routes.ts` | — | No change |
> | **Production boundary** | — | 0 providers / 0 sockets / 0 credentials; D115 WITHHELD; G-034 NOT EXECUTED | — | No change |
>
> All required governance evidence **for the bound scope** exists. K-12 and K-13 are outputs of the
> declaration gate, not prerequisites to it. K-11 is honestly recorded as partial.

**Not chosen because "most NP workstreams are complete."** Chosen because the Program Authority's
scope binding removed the four failing conditions (K-01, K-02, K-03, K-10) from scope, and the
remaining in-scope conditions pass.

**Conditions on this determination:**
1. **§18.4 must be answered** — Phase-5 boundary.
2. A **declaration act** must be recorded (K-12) naming the **declaring authority** (K-13).
3. **Neither requires implementation authority.**

**Not chosen:** **B** (no implementation gap blocks the narrow scope; no implementation authority
granted) · **E** (no substantive in-scope prerequisite remains; NP-13 independent) · **C**
(superseded by the scope binding).

---

## 16. Required Decisions / Authorizations — status

| ID | Decision | Status |
|---|---|---|
| **D-NP15-1** | Bind the meaning of "Broad IPD Phase 1" | ✅ **DECIDED 2026-10-03 — NARROW (1A + 1B + 1C only)** |
| **D-NP15-2** | Designate the authoritative IPD ref/commit for the external repository | ⬜ **STILL OPEN** |
| **D-NP15-3** | Resolve the "IPD" term ambiguity | ✅ **DECIDED 2026-10-03 — SPLIT** |
| **D-NP15-4** | Dispose the two persistence lineages | ✅ **DECIDED 2026-10-03 — BOTH, with a written domain boundary.** Boundary **not yet written** |
| **D-NP15-5** | Adjudicate the engine taxonomy conflict | ⬜ **DEFERRED** (out of narrow scope) |
| **D-NP15-6** | Dispose the two red IRR tests at HEAD | ⬜ **DEFERRED** (out of narrow scope) |
| **D-NP15-7** | Designate the NP-15 durability destination | ✅ **DECIDED 2026-10-03 — BOTH REPOSITORIES.** ⚠️ **Commit/push authority still required — NOT granted by this prompt** |
| **D-NP15-8** | Record NP-01–NP-11 / NP-14 status | ⬜ **DEFERRED** (non-blocking) |
| **D-NP15-9** | Confirm whether Phase-5 Option A is inside or outside narrow Phase 1 | ⬜ **REQUIRED before declaration** (§18.4) |
| **D-NP15-10** | Name the authority that may declare Broad IPD Phase 1 converged | ⬜ **REQUIRED by the declaration act** (K-13) |
| **D-NP15-11** | Grant explicit commit + push authority to publish this record to both repositories | ⬜ **REQUIRED** (GAP-12) |

---

## 17. Recommended Next Gate

> ## `GATE-NP15-PHASE1-CONVERGENCE-DECLARATION`

**Type:** Program Authority declaration gate — **governance only. No implementation. No source
change. No merge. No repin. No deployment.**

**Agenda (four items, in order):**

1. **D-NP15-9** — confirm the Phase-5 boundary: is the Phase-5 Option A offline full-shell
   restoration (routes 13 → 36, nav 13 → 32, `unavailable` status) **inside** the declared narrow
   Phase 1, or a later supersession recorded separately?
2. **D-NP15-10** — name the authority that may declare Broad IPD Phase 1 converged (K-13).
3. **Declaration** — record `CONVERGED WITHIN BOUND SCOPE` (or alternative), stating explicitly the
   scope it applies to and the conditions (K-01…K-13) it was measured against.
4. **D-NP15-11** — grant explicit commit + push authority to publish this record and the decisions
   to **both** repositories (IRR `docs/integration/`; IPD convergence evidence), cross-referenced
   by commit SHA, with independent remote verification.

**Immediately following gates:**
* **PERSISTENCE DOMAIN-BOUNDARY ACT** — write the G24 / NP-04 boundary (GAP-04).
* **IRR↔IPD PIN RECONCILIATION** (read-only) → ref designation (GAP-02, GAP-03).
* **IRR HEAD RED-STATE DISPOSITION** (GAP-07) — independent, may run in parallel.
* **NP-13 D2-01** — rebind the stale `iips-platform` pin to `001b1e3f` (GAP-05).
* **IU-7 EVIDENCE** — supply or record as NOT RECONSTRUCTABLE (GAP-15).

**Standing disclosure carried forward unchanged:**

```text
D115 C / D .......................... UNRESOLVED / WITHHELD / NOT AUTHORIZED
runtimeCompanyId .................... UNRESOLVED
Tenant source of truth .............. D115-deferred
Tenant administration ............... NOT AUTHORIZED
productionEligible .................. false
providers / sockets / credentials ... 0 / 0 / 0
D91/D88 (macro) ..................... standing constraint — Macro EXCLUDED
Dhan Level-1 (live feed) ............ DEFERRED (fixture-level only)
G-034 (live provider) ............... NOT EXECUTED
D114 ................................ FROZEN — untouched
Implementation authority ............ NOT GRANTED
Windows visual acceptance ........... Phase-1B ACCEPTED; Phase 8 NOT HELD; 82+66=148 NOT CLAIMABLE
IU-7 ................................ NOT RECONSTRUCTABLE from either repository
This record ......................... NOT DURABLE (uncommitted working-tree file)
The 2026-10-03 decisions ............ NOT DURABLE (chat only)
```

---

## 18. DECISION RECORD — 2026-10-03 (Program Authority: Ramki)

**Recording agent:** Arena (recording only). **These decisions are NOT DURABLE** — rendered in
session, not published to any authoritative ref.

### 18.1 D-NP15-1 — Scope binding

> **DECIDED: NARROW — Phase 1A + Phase 1B + Phase 1C only.**
>
> This is the only scope with an authored definition
> (`docs/PHASE1_AUTHORIZATION_PREPARATION.md` §L, acceptance criteria AC-01..AC-19).
> Persistence, the IRR↔IPD dependency pin, the engine taxonomy, and IRR itself are **outside**
> the bound scope.

**Consequence:** GAP-02, GAP-03, GAP-06, GAP-07, GAP-10, GAP-13, GAP-15 are **out of NP-15 scope**
and carried forward to their own workstreams. Disposition revised from **C** to **A** (§15.3).

### 18.2 D-NP15-3 — "IPD" term

> **DECIDED: SPLIT THE TERM.**
>
> * **IPD** = the external repository `ramkivs/iips-production-market-data`, used for integration.
> * **`iips-platform`** = the in-repo IRR directory tree, bound separately with its own identifier.
> * The stale NP-13 pin (`27104015…`) is to be **rebound to `001b1e3f…`** (GAP-05).

**Consequence:** X-6 resolved. D-NP15-2 (ref designation) **remains open** — the split resolves the
*term*, not the *ref*.

### 18.3 D-NP15-4 — Persistence

> **DECIDED: BOTH, WITH AN EXPLICIT DOMAIN BOUNDARY.**
>
> * **NP04-G24** (`arena/01a0e6d9` @ `6828155`) = **portfolio / tenancy persistence**.
> * **NP-04** (`np04-governed-persistence-windows` @ `2e11fa3`) = **governed artifact / report
>   persistence**.
> * The boundary **must be written** — the two lines share and conflict on
>   `src/persistence/{errors,index}.ts`.

**Recorded tension (not silently reconciled):** D-NP15-4 was decided even though D-NP15-1 places
persistence **outside** NP-15. The decision is **held in reserve** — valid and recorded, but not
exercised until persistence enters an authorized scope. The domain-boundary act remains required
(GAP-04).

### 18.4 D-NP15-9 — OUTSTANDING: the Phase-5 boundary question

> **NOT YET ANSWERED by the Program Authority.** Required before the declaration.
> **The ambiguity in the earlier wording has been removed (§6.3, §6.4, §15.3); the decision itself
> is still required.**

**Evidence established at the declaration gate (2026-10-03, verified via GitHub API):**

* Phase 5 (`6b8afda`) **modifies Phase-1A-created files** — `app/routes.ts`, `app/navigation.ts`,
  `app/AppShell.tsx`.
* Phase 5 **modifies the Phase-1A test** (`tests/shell_navigation_model.test.ts`) and the Phase-1B
  test (`tests/shell_mount_bi08_route.test.ts`).
* Phase 1A: 13 route constants, nav 2 implemented / 11 future.
  Phase 5: 36 route constants, 32 nav items, new `unavailable` status.
* Phase 1A's presentation kit (`components/**`) and `FeaturePlaceholder` are **NOT** touched by
  Phase 5.
* Phase 1B's BI-08 mount **survives** Phase 5 (BI tree frozen `8491efdc` UNCHANGED; 542/542 pass).

**Therefore: the shell at IPD `main` is the Phase-5 restoration, not the Phase-1A artifact.**

**Question:** under the narrow binding ("1A + 1B + 1C only"), is the Phase-5 Option A shell
restoration an **in-scope restoration of Phase 1A**, or a **separate later/superseding workstream**?

| Selection | Recorded consequence |
|---|---|
| **IN SCOPE** | Phase 1A declared converged **as restored by Phase 5 Option A** (36 route constants, 32 nav items, `unavailable` status) at IPD `main` `4d3e1cd`. |
| **OUT OF SCOPE** | **Phase 1A is declared against its historical execution at `f13002e`; Phase 5 is a separate later shell-restoration/superseding workstream and is not retroactively incorporated into narrow NP-15 Phase 1.** |
| **BOTH** | Phase 1A converged at `f13002e` **and** Phase 5 converged at `6b8afda` — two declarations, one record. |

**Phase 5 is not silently incorporated into Phase 1 merely because its resulting files are present
at IPD `main`.** Neither reading is assumed by this record.

### 18.5 D-NP15-7 / D-NP15-11 — Durability destination

> **DECIDED (destination): BOTH REPOSITORIES.**
>
> * **IRR** — the NP-15 governance record (destination: `docs/integration/`, following NP-13/G-2
>   precedent).
> * **IPD** — the convergence evidence.
> * Cross-referenced by commit SHA.
>
> ⚠️ **Commit and push authority is NOT granted by the NP-15 prompt** and was **not** requested or
> inferred. Until explicitly granted, this record and the decisions above remain **non-durable** —
> as demonstrated by the destruction of report v1.0 and v1.1 (§10.3, occurrences 4 and 5).

---

## 19. PROMPT-COMPLIANCE MATRIX (self-audit)

Every numbered requirement of the NP-15 prompt, mapped to the section that satisfies it.

| § | Requirement | Where | Status |
|---|---|---|---|
| 0 | Execute read-only; no code/config/schema/persistence/patch/merge/rebase/cherry-pick/commit/push/ref change/deployment/production | §0 op log; boundary statement | ✅ **COMPLIANT** — no commit, no push, no history touched |
| 1 | Do not reinterpret NP-15 as a historical NP-15 | §2 anti-reinterpretation check | ✅ **COMPLIANT** — zero `NP-15` hits anywhere |
| 2 | Identify IRR or IPD + repo + branch/ref + commit SHA + read-only for every operation | §0 (10 rows, all labelled) | ✅ **COMPLIANT** |
| 3.1 | Universal Artifact Durability Invariant; 6 fields for every durable claim | §10.1 (8 checks incl. all 6 required) | ✅ **COMPLIANT** |
| 3.2 | Governance ≠ implementation; no inferred authority | §10.2 | ✅ **COMPLIANT** |
| 3.3 | No blind integration; treat prior finding as historical, verified not permission | §3.3; §7.2; §8 (donor = ARCHIVAL) | ✅ **COMPLIANT** — no merge, no branch stacking |
| 4 | Primary objective — what convergence means, what converged, separate by design, unresolved, evidence required, readiness | §6; §8; §9; §13; §15 | ✅ **COMPLIANT** |
| 5 | Historical reconstruction with A/B/C/D classification per finding | §3.1, §3.2 (A/B/C/**D** columns), §3.3 | ✅ **COMPLIANT** |
| 5 | Cover: PIT, B1, Dhan/provider-neutral, D7, persistence, Operator Drop, OIDC/operator-drop, IRR↔IPD, **IU-7**, IU-8, NP-01–NP-14, NP-13 closure, historical NP-15, superseded/deferred work, later decisions | §3; §7.2; §8; §11 | ⚠️ **PARTIAL** — **IU-7 not reconstructable** (§3.5, GAP-15). B1/D7 not durable identifiers (§7.2 note, GAP-14). All others covered. |
| 6 | Establish IPD Phase 1 meaning; concrete inventory; or state `PHASE 1 SCOPE NOT YET AUTHORITATIVELY BOUND` | §6.1–6.4 | ✅ **COMPLIANT** — was UNBOUND, now BOUND by authority |
| 7 | Both baselines with Repository/Remote/Ref/HEAD/Commit/Clean-Dirty/Remote parity/Evidence | §4 and §5 (8-field blocks) | ✅ **COMPLIANT** |
| 8 | Lineage & dependency graph; 9 questions per node | §7.1, §7.2; §8 | ✅ **COMPLIANT** |
| 9 | Convergence matrix, 7 columns, 19 named components | §8 (27 rows, all 19 named components present) | ✅ **COMPLIANT** |
| 9 | Action values restricted to the given vocabulary | §8 legend | ✅ **COMPLIANT** |
| 10 | Contract reconciliation across 19 dimensions; 5 categories | §9.1–9.5 | ✅ **COMPLIANT** |
| 11 | Durability & authority check per claim | §10.1, §10.2 | ✅ **COMPLIANT** |
| 12 | NP-13 hard prerequisite / soft / evidence / independent determination | §12 | ✅ **COMPLIANT** — INDEPENDENT |
| 13 | NP-01–NP-14 classification; 4-step reconciliation where records differ | §11 | ✅ **COMPLIANT** |
| 14 | Measurable convergence conditions; flag new conditions as proposals | §15.1 (K-01…K-13, each sourced) | ✅ **COMPLIANT** |
| 15 | Gap register, 8 columns, no generic TODOs | §13 (GAP-01…GAP-15) | ✅ **COMPLIANT** |
| 16 | Choose exactly one of A–E | §15.2 (C, superseded) and §15.3 (**A**, current) | ✅ **COMPLIANT** — one current determination |
| 17 | No artificial blocker; ask Ramki for authorization; no inferred implementation authority | §16, §18 | ✅ **COMPLIANT** |
| 18 | Final report in the exact 17-section structure | §1–§17 (+ §0, §19) | ✅ **COMPLIANT — 17/17** |
| 19 | Evidence standard: repo / ref / commit / artifact / test evidence / historical decision record | §14 (E-01…E-27) | ✅ **COMPLIANT** |
| 19 | Do not report "verified" unless verification occurred | §14 "Not verified" disclosure block | ✅ **COMPLIANT** |
| 20 | Absolute boundary: no code changes, commits, pushes, merges, rebases, cherry-picks, deployment, production | §0; §18.5 | ✅ **COMPLIANT** |

**Honest exceptions disclosed:**
1. **IU-7** — required by the brief, **not reconstructable** from either repository (§3.5, GAP-15).
2. **B1 / D7** — required by the brief's dependency sketch, **not durable identifiers** in either
   repository; reported as UNKNOWN, not mapped by assumption (§7.2, GAP-14).
3. **IPD tracker `.xlsx`** — not decoded (binary OOXML).
4. **IRR failure attribution** — not determined (shallow clone prevents bisection).
5. **This record is uncommitted** — publication requires D-NP15-11, which is **not** granted.

---

*End of NP-15 — Broad IPD Phase 1 Convergence — READ-ONLY GOVERNANCE INVESTIGATION (v1.2).
No code changed. No commit. No push. No merge. No rebase. No cherry-pick. No deployment.
No production activity. No implementation authority inferred.*
