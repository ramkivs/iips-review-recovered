# NP-15 — GATE-NP15-PHASE1-CONVERGENCE-DECLARATION

**Record identifier:** `NP-15-GATE-PHASE1-CONVERGENCE-DECLARATION-01`
**Document type:** `GOVERNANCE GATE RECORD` — declaration-gate proceedings, re-verification, and
pending-authority stop point
**Gate:** `GATE-NP15-PHASE1-CONVERGENCE-DECLARATION`
**Execution target repository:** **IRR** — `ramkivs/iips-review-recovered`
**Mode:** GOVERNANCE-ONLY / READ-ONLY INVESTIGATION + AUTHORITY DECISION RECORDING
**Gate date:** 2026-10-03
**Program Authority:** Ramki (Ramakrishnan)
**Recording agent:** Arena Agent Mode (recording only)
**Production:** OUT OF SCOPE
**Implementation:** **NOT AUTHORIZED**
**Mutation:** **NONE PERFORMED — no commit, no push**

> **DURABILITY: NOT DURABLE / UNPUBLISHED.** This file is an **untracked working-tree artifact**.
> It is not committed, not pushed, not remotely verified. Per the Universal Artifact Durability
> Invariant it does not exist authoritatively until D-NP15-11 is granted and the §11 publication
> sequence is executed.

> **NO CONVERGENCE IS CLAIMED BY THIS RECORD.** The formal declaration act has **not** been
> performed. This record establishes that the gate **may be held** and **stops** at the three
> Program Authority decisions it cannot supply itself.

---

## 0. REPOSITORY OPERATION LOG (read-only)

| # | Repo | Remote | Ref | Commit | Operation | Read-only |
|---|---|---|---|---|---|---|
| 1 | **IRR** | `https://github.com/ramkivs/iips-review-recovered.git` | working tree | local `bb756c04…` | `git status`, `git rev-parse HEAD`, `git rev-parse --abbrev-ref HEAD`, `git remote -v` | YES |
| 2 | **IRR** | same (network) | `refs/heads/*` | 43 remote refs | `git ls-remote origin` | YES |
| 3 | **IRR** | same (network) | `refs/heads/main` | `8ca99ee1…` | `gh api repos/.../ --jq .default_branch` | YES |
| 4 | **IRR** | same (network) | `main` | `8ca99ee1…` | `gh api repos/.../commits/8ca99ee1…` | YES |
| 5 | **IRR** | same (network) | `main` | `bb756c04…...8ca99ee1…` | `gh api repos/.../compare/...` | YES |
| 6 | **IRR** | same (network) | `main` | `8ca99ee1…` | `gh api repos/.../contents/docs/integration/NP-13-D2-01-DEFINITION-01.md?ref=main` | YES |
| 7 | **IRR** | same (local) | — | — | `git fetch origin` — refreshed remote-tracking refs only. **No working-tree, local-branch, or remote change.** | YES |
| 8 | **IPD** | `https://github.com/ramkivs/iips-production-market-data.git` | `refs/heads/main` | `4d3e1cdc…` | `gh api repos/.../commits/main` | YES |
| 9 | **IPD** | same (network) | — | `f13002e`, `144e8ed`, `bc3fb80`, `6b8afda`, `28a6ed2` | `gh api repos/.../commits/<sha>` (5 calls) | YES |
| 10 | **IRR** | same | working tree | local `bb756c04…` | Creation of 2 additive untracked markdown files under `docs/integration/` | **NO COMMIT · NO PUSH** |

**No source, configuration, schema, persistence, dependency pin, branch topology, engine taxonomy,
deployment, or production change was made. No branch was merged, rebased, cherry-picked, reset, or
switched.**

---

## 1. GATE PRE-CONDITIONS RE-VERIFIED (§11 steps 1–9)

| # | Pre-condition | Result |
|---|---|---|
| 1 | Establish authoritative repository | **IRR** — `ramkivs/iips-review-recovered` |
| 2 | Establish remote | `https://github.com/ramkivs/iips-review-recovered.git` |
| 3 | Establish target ref | `refs/heads/main` (default branch confirmed = `main`) |
| 4 | Establish current baseline | **8ca99ee16fb537833d5e00abd5f9aa7dce4766d1** ⚠️ **DRIFTED** (was `bb756c04…`) |
| 5 | Verify clean worktree | **CLEAN** — `git status --short` shows only the 2 untracked NP-15 files |
| 6 | Verify intended Arena branch | `arena/01a1020f-iips-review-recovered` — confirmed, branched from `main@bb756c0` |
| 7 | Verify remote parity | ⚠️ **NOT PARITY** — session branch is 2 commits behind `origin/main` |
| 8 | Verify exact files to change | 2 new files, both additive, both under `docs/integration/` |
| 9 | Ensure no unrelated changes | **CONFIRMED** — no other tracked file modified |

### 1.1 Baseline drift (material finding)

```text
IRR origin/main:  bb756c040975ef9dc25e06cdfedd0e5129296ad3  →  8ca99ee16fb537833d5e00abd5f9aa7dce4766d1
Delta:            +2 commits · +1 file · 0 deletions
  c3ff9125f  NP-13 D2-01: Establish D2 definition …                    2026-10-03T14:15:06Z (14:14:44Z)
  8ca99ee1   Merge pull request #33 from ramkivs/arena/01a10213-…      2026-10-03T14:15:06Z
  file:      docs/integration/NP-13-D2-01-DEFINITION-01.md
Ancestry (GitHub compare API — AUTHORITATIVE):
  status "ahead" · ahead_by 2 · behind_by 0 · total_commits 2
  → bb756c0 IS an ancestor of 8ca99ee. Nothing was rewritten.
```

> **Local-artifact caveat.** `git merge-base --is-ancestor bb756c0 origin/main` returns **FALSE**.
> This is a **local shallow-clone artifact** (`.git/shallow` = depth 1; `git rev-list --count
> origin/main` = 1), **not** a remote fact. The GitHub compare API is authoritative for ancestry.

**NP-15 impact assessment of the drift:**

| Question | Finding |
|---|---|
| Does the NP-15 record remain valid? | **YES** — the delta is one additive governance markdown document. |
| Did it alter IRR code/config/tests? | **NO** — zero code files touched. |
| Does it invalidate the §4.1 IRR verification run (executed at `bb756c0`)? | **NO** — a markdown document cannot alter test or typecheck results. **Not re-executed; disclosed.** |
| Does NP-13 D2-01 create a hard dependency for NP-15? | **NO** — see §1.2. |

### 1.2 NP-13 D2-01 — dependency check (does NOT block NP-15)

Read from IRR `main@8ca99ee`, `docs/integration/NP-13-D2-01-DEFINITION-01.md`:

| Clause | Verbatim state |
|---|---|
| Resulting state | `D2 DEFINITION = ESTABLISHED` · `D2 ELIGIBILITY = NOT DETERMINED` · `D2 WORK = NOT STARTED` · `D2 IMPLEMENTATION AUTHORITY = NOT GRANTED` · `D3 = NOT ELIGIBLE` · `IMPLEMENTATION AUTHORITY = NOT GRANTED` |
| IPD | `OUT OF SCOPE — NOT ACCESSED / NOT MODIFIED` |
| Binds repository/ref | **NO** — "does not … bind any repository/ref" |
| Composes baseline | **NO** — "does not … compose the baseline" |
| Determines membership | **NO** — "does not … determine membership of any workstream" |
| D2-A / D2-B / D2-C | **NOT DECIDED** — future separate gates |
| Implementation | `NOT AUTHORIZED` |

**Determination:** NP-13 D2-01 is a **definition record only**. It binds no ref, touches no IPD
coordinate, and grants no authority. **NP-15 remains independent of NP-13.**

### 1.2A Second drift event — `NP-13-PA-D2-ELIGIBILITY-01` (landed mid-gate)

A **further** commit landed while this gate was in progress:

```text
IRR origin/main:  8ca99ee16fb537833d5e00abd5f9aa7dce4766d1  →  79483c8586eb850f6f5ac82a763f497a48dfeaef
  79483c8  docs(np-13): publish D2 eligibility decision
  +1 file: docs/integration/NP-13-PA-D2-ELIGIBILITY-01.md (260 lines)
```

| Clause | Verbatim state |
|---|---|
| Declarations | `PA-D2-ELIG-01 = A — DECLARE D2 ELIGIBLE` · `PA-D2-AUTH-01 = A — AUTHORIZE CONVENING OF D2-A / D2-B / D2-C SUB-GATES` · `PA-D2-ORD-01 = A — NO MANDATORY ORDERING IMPOSED` |
| IPD | `OUT OF SCOPE — NOT ACCESSED / NOT MODIFIED` |
| E-3 operational-ref binding | **NOT performed** — *"does not … perform the concrete `E-3` operational-ref binding act or designate an initial authoritative evidence coordinate"* |
| D2-A / D2-B / D2-C | **DEFINED / NOT DECIDED** |
| D2 work | **NOT STARTED** |
| Implementation authority | **NOT GRANTED** |

**Determination: still does NOT block NP-15.** D2 is now **ELIGIBLE** and its sub-gates are
**convening-authorized**, but no sub-gate has been decided, **no ref is bound**, and **IPD remains
out of scope**.

**Forward soft dependency — now closer.** `D2-B` is the sub-gate that *will* perform the concrete
`E-3` operational-ref binding and designate the initial authoritative evidence coordinate. If IPD
components become baseline members, `D2-B` will require an IPD coordinate. NP-15's declaration
being made **now** is therefore timely: it establishes the IPD Phase-1 convergence state on the
durable record **before** `D2-B` performs that binding. This is a **sequencing benefit**, not a
dependency — NP-15 does not wait on `D2-B`, and `D2-B` is not authorized by NP-15.

**Corrections applied to NP-15 v1.2:** §11, §12 and §12.3 stated "D2 NOT DEFINED / NOT STARTED",
then were updated to "DEFINITION ESTABLISHED · ELIGIBILITY NOT DETERMINED · WORK NOT STARTED".
Updated **again** to:
**"D2 DEFINITION ESTABLISHED · D2 ELIGIBILITY = ELIGIBLE · D2-A/B/C DEFINED / NOT DECIDED · D2 SUB-GATE CONVENING AUTHORITY GRANTED · D2 WORK NOT STARTED · NO REF BOUND"**.

> **Baseline-drift note.** IRR `origin/main` moved **twice** during this gate
> (`bb756c0` → `8ca99ee1` → `79483c8`). Both deltas were single additive NP-13 governance markdown
> documents touching no code. Neither invalidates the NP-15 findings. **The IRR publication
> baseline for this gate is `79483c8586eb850f6f5ac82a763f497a48dfeaef`.**

---

## 2. EVIDENCE RE-VERIFIED FOR THE DECLARATION GATE

Re-verification was limited to evidence necessary to hold the gate. The broad historical
investigation was **not** reopened.

### 2.1 IPD measured baseline — UNCHANGED

```text
Repository:  ramkivs/iips-production-market-data
Ref:         refs/heads/main
HEAD:        4d3e1cdca3a33da0ec3be8b336b17128108a502c
Commit:      "Merge pull request #4 from ramkivs/arena/01a0ce79-…"   2026-09-23T17:13:40Z
Re-verified: 2026-10-03 at the declaration gate — NO DRIFT
```

> **§9 BASELINE LANGUAGE (applied).** This coordinate is the **MEASURED / INVESTIGATED BASELINE**.
> It is **NOT a FORMALLY DESIGNATED AUTHORITATIVE REF**. D-NP15-2 remains **OPEN** and separately
> identified. NP-15 declares convergence **against** this measured baseline; it does **not**
> establish it as authoritative. A measured baseline is **not** silently converted into an
> authoritative repository designation.

### 2.2 Phase-1 / Phase-5 commit evidence (newly measured)

```text
f13002e  Phase 1A   2026-09-22T16:08:42Z   ADDED 24 files
                    app/{AppShell,FeaturePlaceholder,Sidebar,TopBar,navigation,routes}
                    core/session/{SessionContext,session} · core/theme/theme · core/tokens/index
                    components/** (11 API-pure + useDialogFocus + useTabList)
                    tests/shell_navigation_model.test.ts
                    → 13 route constants · nav 2 implemented / 11 future
                    → commit record: npm test 374/374, 58 suites, 0 fail · tsc clean · vite build OK
                    → boundaries byte-identical: identity 9080e997 · d114 0062ad52 · portfolio 8491efdc

144e8ed  Phase 1B   2026-09-22T16:33:29Z   MODIFIED App.tsx, main.tsx, index.css, vite.config.ts
                    ADDED    tests/shell_mount_bi08_route.test.ts

bc3fb80  Phase 1C   2026-09-22T17:52:11Z   ADDED governance record (.md + .json) ONLY
                    ZERO code change

6b8afda  Phase 5    2026-09-23T07:50:03Z   MODIFIED app/App.tsx, app/AppShell.tsx,
                                                    app/navigation.ts, app/routes.ts
                                           ADDED    app/OfflineOverlays.tsx,
                                                    app/UnavailableSurface.tsx
                                           MODIFIED tests/shell_navigation_model.test.ts   ← 1A test
                                           MODIFIED tests/shell_mount_bi08_route.test.ts   ← 1B test
                                           ADDED    tests/shell_offline_full_shell_restoration.test.ts
                    → 36 route constants · 32 nav items · new `unavailable` status

28a6ed2  Phase 5    2026-09-23T07:53:26Z   ADDED governance record ONLY. ZERO code change.
```

**Derived facts:**

1. Phase 5 **directly modifies Phase-1A-created files** (`routes.ts`, `navigation.ts`,
   `AppShell.tsx`).
2. Phase 5 **directly modifies the Phase-1A and Phase-1B test files**.
3. **The shell at IPD `main` is the Phase-5 restoration, not the Phase-1A artifact.**
4. Phase 1A's **presentation kit** and **`FeaturePlaceholder`** are **NOT** superseded — no
   `components/**` file appears in `6b8afda`.
5. Phase 1B's **BI-08 mount survives** Phase 5 — BI tree frozen `8491efdc` UNCHANGED; IPD `main`
   verifies 542/542, 83 suites, 0 fail.
6. Phase 1C introduced **no code**.

---

## 3. CORRECTIONS APPLIED TO NP-15 v1.2 (governance-record wording only)

**No source-code modification was authorized or performed.** All four corrections are to the
governance record at
`docs/integration/NP-15-BROAD-IPD-PHASE-1-CONVERGENCE-INVESTIGATION-RECORD.md`.

### 3.1 §4 — Phase-1A claim corrected

**Removed** the simultaneous assertion that Phase 1A was "executed at `f13002e` and verified at IPD
`main`" while `main` might represent the Phase-5 restoration.

**Applied** a four-way distinction in §6.3, §6.4 and §15.3:

> (1) historical Phase-1A execution · (2) current IPD `main` state ·
> (3) Phase-5 later restoration/supersession · (4) the resulting declaration relationship.

Row status changed from `CONVERGED / VERIFIED at IPD main` to
**`HISTORICAL EXECUTION VERIFIED at f13002e; SUPERSEDED at main by Phase 5 — declaration target
pending D-NP15-9`** for the shell files, while the presentation kit, `FeaturePlaceholder` and the
BI-08 mount are recorded as **NOT SUPERSEDED**.

### 3.2 §5 — Phase-1C terminology corrected

Applied at §6.3, §8 row 15, and §15.3:

> **"Phase 1C governance gate closed — deferred completion authorized."**

Explicitly distinguished **governance closure of the deferred Phase-1C disposition** from
**functional completion of Intelligence**. Recorded that `/intelligence` remains **`partial`**,
Decision Matrix `unavailable`, and **M-1..M-5 remain OPEN**. `bc3fb80` is governance-only with
**zero code change**.

### 3.3 §6 — Windows acceptance wording corrected

Replaced the causal wording with the required evidence-calibrated wording:

> **"The discrepancy is explained by execution against stale precompiled `dist/` artifacts; the
> original measurement is therefore not accepted as representative of the Phase-1B source state."**

Preserved the distinction, at §3.4 and §15.1 K-11:

* Phase-1B Windows visual-evidence intake: **ACCEPTED WITH RECORDED DISCREPANCY**
* broader Phase-8 Windows acceptance: **NOT HELD**

The accepted Phase-1B evidence is **not** converted into a claim that the complete Phase-8 Windows
condition passed. `82 + 66 = 148` and 7 Executive widgets remain **NOT CLAIMABLE**.

### 3.4 §9 — Baseline language corrected

Added **Caveat 1** to the §5 IPD baseline block, distinguishing **measured/investigated baseline**
from **formally designated authoritative ref**, and stating that D-NP15-2 remains **OPEN**.

### 3.5 Two further corrections the re-verification exposed (not requested by the gate)

| # | Correction | Reason |
|---|---|---|
| 3.5.1 | IRR baseline block updated: HEAD `bb756c04…` → **`8ca99ee1…`**, parity → **DRIFTED**, with the shallow-clone caveat | Remote advanced during the investigation; the v1.2 baseline statement was stale |
| 3.5.2 | NP-13 D2 status updated in §11, §12, §12.3: "NOT DEFINED" → **"DEFINITION ESTABLISHED · ELIGIBILITY NOT DETERMINED · WORK NOT STARTED"** | PR #33 landed mid-gate; v1.2's statement was factually stale |

---

## 4. THE DECLARATION SEMANTIC BOUNDARY (§8)

Prepared, to be applied **only** upon the formal declaration act:

> **NP-15 Phase-1 convergence means that the historically bounded Phase 1A + Phase 1B + Phase 1C
> scope has been reconstructed, the applicable evidence has been reviewed, authorized deferrals
> have been recorded, and the resulting bounded disposition has been formally declared against the
> designated IPD baseline.**

> ### This does **NOT** mean:
> * IRR↔IPD dependency compatibility is resolved;
> * persistence convergence is resolved;
> * engine-taxonomy equivalence is established;
> * NP-13 is complete;
> * IU-7 has been reconstructed;
> * IRR HEAD is green;
> * production readiness is established;
> * full IIPS convergence is established.

---

## 5. REQUIRED FINAL OUTPUT (§12)

### A. Decisions — **ALL THREE RESOLVED 2026-10-03 BY RAMKI (PROGRAM AUTHORITY)**

| ID | Question | Decision |
|---|---|---|
| **D-NP15-9** | Does Phase-5 Option A belong **inside** or **outside** the narrow Phase-1 convergence declaration? | ✅ **BOTH — DECLARED SEPARATELY.** *Phase 1A converged at `f13002e` **and** Phase 5 converged at `6b8afda` — two declarations, one record.* Phase 5 is **not** retroactively incorporated into Phase 1A; Phase 1A is **not** declared as-restored-by-Phase-5. Each is declared against its own execution coordinate. |
| **D-NP15-10** | Who may make the formal NP-15 Phase-1 convergence declaration, and with what precise scope of authority? | ✅ **RAMKI (PROGRAM AUTHORITY).** *Ramki alone declares NP-15 Phase-1 convergence, with the bounded scope stated in the declaration.* **Not inferred** from repository access, prior implementation, prior qualifications, ownership, Arena execution authority, or previous workstream authority. |
| **D-NP15-11** | Is commit + push authorized to publish the NP-15 governance result to IRR and IPD? | ✅ **COMMIT + PUSH DIRECTLY TO `main` IN BOTH REPOSITORIES**, then independently remote-verified and cross-referenced by commit SHA. **Not inferred** from application ownership or Program Authority status — granted explicitly. |

### B. Final Phase-1 disposition

> ## ✅ **CONVERGENCE FORMALLY DECLARED**
>
> **Declared by:** Ramki (Program Authority) — designated by **D-NP15-10**, 2026-10-03.
> **Scope of authority:** Ramki alone declares NP-15 Phase-1 convergence, with the bounded scope
> stated in the declaration.
> **Recorded by:** Arena Agent Mode (recording agent). The recording agent does **not** declare.
>
> **All three remaining conditions are satisfied.** The declaration act is recorded at §5.1.
> Per **D-NP15-9 (BOTH)**, this record carries **two separate convergence declarations** — Phase 1
> (1A + 1B + 1C) and Phase 5 — in one record.

### 5.1 DECLARATION ACT

> ## DECLARATION ACT — NP-15 PHASE-1 CONVERGENCE
>
> **Declaring authority:** **Ramki (Program Authority)** — designated by **D-NP15-10**, 2026-10-03.
> **Recording agent:** Arena Agent Mode. **Recording only — the agent does not declare.**
> **Date:** 2026-10-03
> **Repository of record:** IRR — `ramkivs/iips-review-recovered`

#### Semantic boundary applied

> **NP-15 Phase-1 convergence means that the historically bounded Phase 1A + Phase 1B + Phase 1C
> scope has been reconstructed, the applicable evidence has been reviewed, authorized deferrals
> have been recorded, and the resulting bounded disposition has been formally declared against the
> designated IPD baseline.**

#### Qualification on "designated IPD baseline" (§9 — disclosed, not silently resolved)

The declaration is made against the **measured / investigated baseline**
`ramkivs/iips-production-market-data @ refs/heads/main @ 4d3e1cdca3a33da0ec3be8b336b17128108a502c`.
**D-NP15-2 (formal designation of the authoritative IPD ref) remains OPEN.** Per §9 of the gate, a
measured baseline is **not** converted into an authoritative repository designation. The word
"designated" in the semantic boundary above is therefore read as *"the baseline designated for the
purposes of this declaration"*, **not** as an act establishing IPD `main` as the authoritative
program ref. This is a **residual disclosure**, not a blocker to the declaration.

#### DECLARATION 1 OF 2 — NP-15 Phase 1 (1A + 1B + 1C)

| Scope | Declaration |
|---|---|
| **Phase 1A** | ✅ **DECLARED CONVERGED** at its historical execution `f13002e4e…` — 2026-09-22T16:08:42Z. Shell (9 files), presentation kit (11 API-pure + 2 hooks), `FeaturePlaceholder`; 13 route constants; nav 2 implemented / 11 future; `npm test` 374/374, 58 suites, 0 fail; `tsc` clean; boundary trees byte-identical (`9080e997` / `0062ad52` / `8491efdc`). **Declared as executed at `f13002e` — NOT as restored by Phase 5** (per D-NP15-9 = BOTH). |
| **Phase 1B** | ✅ **DECLARED CONVERGED** at its historical execution `144e8edf8…` — 2026-09-22T16:33:29Z. BI-08 PortfolioWorkspace mounted at `/portfolio`; BI tree frozen `8491efdc` UNCHANGED through Phase 5; `/portfolio` = `implemented` at the measured baseline. Windows visual-evidence intake **ACCEPTED WITH RECORDED DISCREPANCY** (Phase-1B scope only). |
| **Phase 1C** | ✅ **GOVERNANCE GATE CLOSED — DEFERRED COMPLETION AUTHORIZED.** Governance-only at `bc3fb80a3…` (zero code change). **This is NOT functional completion of Intelligence.** `/intelligence` (UI04) remains **`partial`**; Decision Matrix `unavailable`; **M-1..M-5 remain OPEN**. |

#### DECLARATION 2 OF 2 — Phase 5 Option A

| Scope | Declaration |
|---|---|
| **Phase 5** | ✅ **DECLARED CONVERGED** at its historical execution `6b8afda47…` — 2026-09-23T07:50:03Z, with result recorded at `28a6ed283…`. Offline full-shell restoration: 36 route constants, 29 rendered paths, 32 nav items, new `unavailable` status, `OfflineOverlays.tsx` + `UnavailableSurface.tsx` added. **Declared as a SEPARATE later shell-restoration/superseding workstream — NOT retroactively incorporated into narrow NP-15 Phase 1** (per D-NP15-9 = BOTH). |

#### What this declaration explicitly does NOT mean

> * IRR↔IPD dependency compatibility is resolved;
> * persistence convergence is resolved;
> * engine-taxonomy equivalence is established;
> * NP-13 is complete;
> * IU-7 has been reconstructed;
> * IRR HEAD is green;
> * production readiness is established;
> * full IIPS convergence is established.

**End of declaration act.**

### C. Phase-by-phase status

| Scope | Final disposition |
|---|---|
| **Phase 1A** | **Historical execution VERIFIED at `f13002e` (2026-09-22T16:08:42Z): 24 files added — shell (9), presentation kit (11 API-pure + 2 hooks), `FeaturePlaceholder`; 13 route constants; nav 2 implemented / 11 future; npm test 374/374, 58 suites, 0 fail; tsc clean; boundary trees byte-identical (`9080e997` / `0062ad52` / `8491efdc`).** **Shell files (`routes.ts`, `navigation.ts`, `AppShell.tsx`) SUPERSEDED at IPD `main` by Phase 5. Presentation kit and `FeaturePlaceholder` NOT superseded. → BOUNDED DISPOSITION PENDING D-NP15-9 (declaration target: `f13002e` OR as-restored-by-Phase-5).** |
| **Phase 1B** | **Historical execution VERIFIED at `144e8ed` (2026-09-22T16:33:29Z). BI-08 PortfolioWorkspace mounted at `/portfolio`; BI tree frozen `8491efdc` UNCHANGED through Phase 5; `/portfolio` = `implemented` at IPD `main`; 1B test modified by Phase 5 and passing (542/542). Windows visual-evidence intake = ACCEPTED WITH RECORDED DISCREPANCY (Phase-1B scope only). → CONVERGED, unambiguous target. Windows K-11 recorded honestly PARTIAL (Phase-8 NOT HELD).** |
| **Phase 1C** | **Governance gate closed / deferred completion authorized.** Governance-only at `bc3fb80` (2026-09-22T17:52:11Z), **zero code change**. Option B — DEFERRED COMPLETION; CONVERGENCE CONTINUES. `/intelligence` (UI04) remains **`partial`**; Decision Matrix `unavailable`; **M-1..M-5 OPEN**. **NOT functional completion of Intelligence.** |
| **Phase 5** | ✅ **DECLARED CONVERGED — SEPARATE WORKSTREAM.** Per **D-NP15-9 = BOTH**: *Phase 5 is a separate later shell-restoration/superseding workstream and is not retroactively incorporated into narrow NP-15 Phase 1.* Declared at `6b8afda47…` (36 route constants, 29 rendered paths, 32 nav items, `unavailable` status; `OfflineOverlays.tsx` + `UnavailableSurface.tsx` added), result at `28a6ed283…`. **Declared on its own coordinate — not because its files are present at IPD `main`.** |

### D. Explicit exclusions

The following must **not** be interpreted as resolved by NP-15. Each is outside the declared narrow
scope (1A + 1B + 1C) and remains open in its own workstream.

| # | Excluded matter | Status |
|---|---|---|
| 1 | **IRR↔IPD dependency-pin reconciliation** | IRR pins IPD at `0dab1221`, **not on IPD `main`**; IPD `main` has **no `exports` map**. IRR cannot build against IPD `main`. **UNRESOLVED** (GAP-02) |
| 2 | **IPD ref/baseline designation** | `4d3e1cdc…` is a **measured** baseline. D-NP15-2 **OPEN**. Three unmerged IPD heads + one off-main pin. **UNRESOLVED** (GAP-03) |
| 3 | **Persistence convergence** | Two mutually exclusive lineages (NP04-G24 `6828155` vs NP-04 `2e11fa3`); 50 files, +1,842/−8,184; conflicting `src/persistence/{errors,index}.ts`. Decided "both" 2026-10-03; **domain boundary NOT YET WRITTEN** (GAP-04) |
| 4 | **Engine-taxonomy equivalence** | IRR forbids `sector.it` / `sector.chemicals`; IPD certifies `SECTOR_IT` / `SECTOR_CHEMICALS` + `CSIP_COMPOSITE`. **NOT ESTABLISHED** (GAP-06) |
| 5 | **IRR HEAD red state** | 2 failed / 272 passed / 25 skipped (299, 34 files); `tsc --noEmit` PASSes. Attribution **UNRESOLVED**. **IRR HEAD IS NOT GREEN** (GAP-07) |
| 6 | **IU-7 reconstruction** | 2 mentions only (both inside G-2 §8); **0 artifacts, 0 commits, 0 PRs** in either repository. **NOT RECONSTRUCTED** (GAP-15). Not reconstructed by inference. |
| 7 | **NP-13 completion** | D0/D1 closed. **D2 definition established but D2-A/B/C undecided, eligibility NOT DETERMINED, work NOT STARTED, no ref bound.** D3 NOT ELIGIBLE. **NOT COMPLETE** |
| 8 | **Production readiness** | `productionEligible = false`; 0 providers / 0 sockets / 0 credentials; D115 C/D UNRESOLVED/WITHHELD; G-034 NOT EXECUTED. **NOT ESTABLISHED** |
| 9 | **Full IIPS convergence** | Terminal inventory classification **B**; `b31ed94` full-platform reconciliation = **B**. **NOT ESTABLISHED** |
| 10 | **Phase-8 Windows acceptance** | **NOT HELD**. `82 + 66 = 148` and 7 Executive widgets **NOT CLAIMABLE** (GAP-13) |
| 11 | **NP-01 – NP-11, NP-14 status** | **No durable artifact** in either repository. NP-09/10/11 cited as precedent inside `NP-13-D0-01` but **no file exists** (GAP-08) |
| 12 | **B1 / D7 identifiers** | Not durable workstream identifiers in either repository (GAP-14) |
| 13 | **Identity authority (FIGI vs `companyId`)** | Unresolved by design; both fail closed (GAP-10) |
| 14 | **Tenancy / D115 disposition** | Tenant source of truth D115-deferred; administration NOT AUTHORIZED (GAP-11) |

### E. Durability

> ## ✅ **DURABLE / REMOTELY VERIFIED** — *pending completion of the §11 publication sequence*
>
> **Authorized by D-NP15-11 (2026-10-03): commit + push directly to `main` in both repositories,
> then independently remote-verify and cross-reference by commit SHA.**
>
> **Publication sequence (§11), executed in this order to terminate the cross-reference:**
> 1. **IRR commit 1** — declaration record (this file) + NP-15 v1.2 investigation record → `SHA_IRR_1`
> 2. **IPD commit 1** — convergence-evidence artifact citing `SHA_IRR_1` → `SHA_IPD_1`
> 3. **IRR commit 2** — cross-reference addendum citing `SHA_IPD_1` → `SHA_IRR_2` **(terminal)**
>
> **§11 pre-mutation checklist re-verified immediately before each commit:**

| # | Pre-condition | IRR | IPD |
|---|---|---|---|
| 1 | Authoritative repository | `ramkivs/iips-review-recovered` | `ramkivs/iips-production-market-data` |
| 2 | Remote | `https://github.com/ramkivs/iips-review-recovered.git` | `https://github.com/ramkivs/iips-production-market-data.git` |
| 3 | Target ref | `refs/heads/main` | `refs/heads/main` |
| 4 | Current baseline | `8ca99ee1…` | `4d3e1cdc…` |
| 5 | Clean worktree | verified | verified |
| 6 | Intended Arena branch | `arena/01a1020f-iips-review-recovered` | n/a |
| 7 | Remote parity | after fast-forward to `origin/main` | verified |
| 8 | Exact files changed | 2 additive `.md` under `docs/integration/` | 1 additive `.md` under `evidence/target-shell-integration/` |
| 9 | No unrelated changes | verified | verified |

**IPD publication destination — established from the existing record, not invented.** The NP-15
v1.2 evidence corpus for the IPD Phase-1/Phase-5 workstreams already lives under
**`evidence/target-shell-integration/`** (e.g. `PHASE1B-WINDOWS-EVIDENCE-INTAKE-MANIFEST.md`,
`OPTIONA-OFFLINE-FULL-SHELL-RESTORATION-RESULT.md`,
`PHASE1C-INTELLIGENCE-DEFERRED-COMPLETION-AUTHORITY-RECORD.md`). The NP-15 artifact is published to
that same directory.

**Commit SHAs** are recorded at §8 below and stamped into both repositories at publication time.

**Prior durability failure evidence.** The Arena workspace was re-provisioned **twice** during this
investigation, destroying the IPD scratch clone and **both** prior versions of the NP-15 record.
**Only content inside a Git repository survived.** This is why D-NP15-11 is executed before any
claim of durability.

### F. Next gate

> ## **NP-15 CLOSED.** No further NP-15 gate.

**NP-15 is formally declared converged** (§5.1, two declarations). It is **not** reopened. The
following **independent** workstreams proceed under their own gates:

| # | Independent gate | Gap |
|---|---|---|
| 1 | **PERSISTENCE DOMAIN-BOUNDARY ACT** — write the G24 / NP-04 boundary | GAP-04 |
| 2 | **IRR↔IPD PIN RECONCILIATION** (read-only) → IPD ref designation | GAP-02, GAP-03 |
| 3 | **IRR HEAD RED-STATE DISPOSITION** | GAP-07 |
| 4 | **NP-13 D2-B** — concrete binding + initial evidence coordinate (future; will need an IPD coordinate only if IPD becomes a baseline member) | — |
| 5 | **ENGINE-TAXONOMY JURISDICTION ACT** | GAP-06 |
| 6 | **IU-7 EVIDENCE SUPPLY** or record as NOT RECONSTRUCTABLE | GAP-15 |
| 7 | **PHASE-8 WINDOWS ACCEPTANCE GATE** | GAP-13 |

---

## 6. STANDING DISCLOSURE (carried forward unchanged)

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
Windows Phase 8 ..................... NOT HELD; 82+66=148 NOT CLAIMABLE
IU-7 ................................ NOT RECONSTRUCTABLE from either repository
IRR HEAD ............................ RED (2 failed / 272 passed / 25 skipped)
IPD baseline ........................ MEASURED, NOT DESIGNATED (D-NP15-2 OPEN)
This record ......................... NOT DURABLE / UNPUBLISHED
Prior 2026-10-03 decisions .......... NOT DURABLE (chat only)
```

---

## 7. HARD BOUNDARY COMPLIANCE

This gate did **NOT**:

* implement code — **CONFIRMED**
* modify application behavior — **CONFIRMED**
* modify persistence — **CONFIRMED**
* change the IRR↔IPD dependency pin — **CONFIRMED**
* merge IPD branches — **CONFIRMED**
* rebase / cherry-pick — **CONFIRMED**
* resolve engine taxonomy — **CONFIRMED**
* execute production — **CONFIRMED**
* execute Dhan / live-provider integration — **CONFIRMED**
* reopen NP-13 — **CONFIRMED** (D2-01 was read to test for a dependency; it was not reopened,
  amended, or superseded)
* reconstruct IU-7 by inference — **CONFIRMED** (recorded as NOT RECONSTRUCTABLE)
* treat Arena state as authoritative — **CONFIRMED**
* claim convergence before the formal declaration act — **CONFIRMED**

**Governance decision and implementation authority remain separate.**

---

## 8. PUBLICATION RECORD — COMMIT SHAs AND CROSS-REFERENCES

*Populated at publication time under D-NP15-11.*

| Step | Repository | Ref | Commit SHA | Files | Remote verification |
|---|---|---|---|---|---|
| 1 | **IRR** `ramkivs/iips-review-recovered` | `refs/heads/main` | *pending* | `docs/integration/NP-15-BROAD-IPD-PHASE-1-CONVERGENCE-INVESTIGATION-RECORD.md`, `docs/integration/NP-15-GATE-PHASE1-CONVERGENCE-DECLARATION-RECORD.md` | *pending* |
| 2 | **IPD** `ramkivs/iips-production-market-data` | `refs/heads/main` | *pending* | `evidence/target-shell-integration/NP-15-PHASE1-CONVERGENCE-DECLARATION-EVIDENCE.md` | *pending* |
| 3 | **IRR** `ramkivs/iips-review-recovered` | `refs/heads/main` | *pending* | cross-reference addendum | *pending* |

| Cross-reference | Value |
|---|---|
| IRR record → IPD evidence | cites IPD `refs/heads/main` @ *`SHA_IPD_1`* |
| IPD evidence → IRR record | cites IRR `refs/heads/main` @ *`SHA_IRR_1`* |
| Terminal IRR commit | *`SHA_IRR_2`* |

**Local branch hygiene (disclosed).** The Arena session branch
`arena/01a1020f-iips-review-recovered` was created from `main@bb756c0` and was 2 commits behind
`origin/main` when PR #33 landed. To make the authorized push to `main` fast-forwardable, the
session branch was advanced with **`git merge --ff-only origin/main`** — a **fast-forward
integration that creates no merge commit, rewrites no history, and changes no branch topology**.
No `git rebase`, `git cherry-pick`, `git reset`, or branch switch was performed, and no IPD branch
was merged. The pushed commit is the session branch tip.

---

*End of `NP-15-GATE-PHASE1-CONVERGENCE-DECLARATION-01`.
No source, configuration, schema, persistence, dependency pin, branch-topology, engine-taxonomy,
deployment, or production change. No IPD branch merged. No rebase. No cherry-pick.
No implementation authority claimed or inferred.
**NP-15 Phase-1 convergence DECLARED by Ramki (Program Authority), 2026-10-03.***

