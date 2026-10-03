# NP-15 — IPD-SIDE EVIDENCE ARTIFACT (PUBLICATION TO IPD PENDING / BLOCKED)

> ## ⚠️ THIS FILE IS NOT PUBLISHED TO IPD
>
> **Intended destination (per D-NP15-7 / D-NP15-11):**
> `ramkivs/iips-production-market-data` @ `refs/heads/main` @
> `evidence/target-shell-integration/NP-15-PHASE1-CONVERGENCE-DECLARATION-EVIDENCE.md`
>
> **Actual publication status: FAILED — NOT PUBLISHED.**
> `git push` → `403 Permission to ramkivs/iips-production-market-data.git denied to ramkivs`
> Contents API `PUT /repos/.../contents/...` → `403 Resource not accessible by integration`
>
> **Root cause:** the Arena sandbox GitHub credential is an **integration token scoped to
> `ramkivs/iips-review-recovered` only**. It has **no write access** to
> `ramkivs/iips-production-market-data` (push to IPD is not merely unauthorized by the gate —
> it is **technically impossible** with this credential).
>
> **Why this file exists in IRR:** solely to preserve the artifact content against the documented
> Arena workspace-durability failure mode. **IRR is a holding location, not the declared
> destination.** It must be relocated to the IPD path above (or deleted) once IPD write access
> is available. This is an interim preservation measure, not a change of publication destination.
>
> **IPD remote state: UNCHANGED** — `ramkivs/iips-production-market-data` `refs/heads/main`
> remains at `4d3e1cdca3a33da0ec3be8b336b17128108a502c`. Nothing was written to IPD.
>
> See: `docs/integration/NP-15-GATE-PHASE1-CONVERGENCE-DECLARATION-RECORD.md` §8.

---

# NP-15 — PHASE-1 CONVERGENCE DECLARATION EVIDENCE (IPD SIDE)

**Record identifier:** `NP-15-PHASE1-CONVERGENCE-DECLARATION-EVIDENCE-01`
**Document type:** `CONVERGENCE EVIDENCE RECORD` — IPD-side durable evidence for the NP-15 Phase-1
convergence declaration
**Repository:** IPD — `ramkivs/iips-production-market-data`
**Authoritative durability destination:** `origin/main` (`refs/heads/main`)
**Publication location rationale:** the existing NP-15-relevant IPD convergence-evidence directory,
`evidence/target-shell-integration/` — **established from the existing record, not invented**
(siblings: `PHASE1B-WINDOWS-EVIDENCE-INTAKE-MANIFEST.md`,
`OPTIONA-OFFLINE-FULL-SHELL-RESTORATION-RESULT.md`,
`PHASE1C-INTELLIGENCE-DEFERRED-COMPLETION-AUTHORITY-RECORD.md`)
**Gate:** `GATE-NP15-PHASE1-CONVERGENCE-DECLARATION`
**Evidence date:** 2026-10-03
**Program Authority:** Ramki (Ramakrishnan)
**Recording agent:** Arena Agent Mode (recording only)
**Production:** OUT OF SCOPE
**Implementation:** **NOT AUTHORIZED**
**Mutation:** one additive markdown file — no source, configuration, schema, persistence,
dependency-pin, branch-topology, engine-taxonomy, deployment, or production change

---

## 0. CROSS-REFERENCE (by commit SHA)

| Direction | Coordinate |
|---|---|
| **IPD evidence → IRR record** | **IRR** `ramkivs/iips-review-recovered` @ `refs/heads/main` @ **`6dd5906262c9a94a87c8bcd321bc69b96c73707a`** — `docs/integration/NP-15-GATE-PHASE1-CONVERGENCE-DECLARATION-RECORD.md` (blob `02f50b87035355d2bba45b2d2a15f9fa9fb97368`) and `docs/integration/NP-15-BROAD-IPD-PHASE-1-CONVERGENCE-INVESTIGATION-RECORD.md` (blob `373be3c69438a5a022dc423762b5ba93ff2ae15a`) |
| **IRR record → IPD evidence** | **IPD** `ramkivs/iips-production-market-data` @ `refs/heads/main` — this file, `evidence/target-shell-integration/NP-15-PHASE1-CONVERGENCE-DECLARATION-EVIDENCE.md`. SHA stamped into the IRR record at **IRR commit 2** (terminal). |

**Publication sequence (terminating):**
1. IRR commit 1 → `6dd5906262c9a94a87c8bcd321bc69b96c73707a` ✅ **PUBLISHED**
2. IPD commit 1 → this commit (cites IRR `6dd5906…`)
3. IRR commit 2 → cross-reference addendum citing this IPD commit SHA **(terminal)**

---

## 1. MEASURED BASELINE

```text
Repository:  ramkivs/iips-production-market-data
Remote:      https://github.com/ramkivs/iips-production-market-data.git
Ref:         refs/heads/main
HEAD:        4d3e1cdca3a33da0ec3be8b336b17128108a502c
Commit:      "Merge pull request #4 from ramkivs/arena/01a0ce79-…"   2026-09-23T17:13:40Z
Clean/Dirty: CLEAN (verified immediately before publication)
Remote parity: PARITY (verified immediately before publication)
```

> ### MEASURED — NOT DESIGNATED
> This coordinate is the **MEASURED / INVESTIGATED BASELINE** used by NP-15. It is **NOT a
> FORMALLY DESIGNATED AUTHORITATIVE REF**. **D-NP15-2 remains OPEN** and separately identified.
> NP-15 declares convergence **against** this measured baseline; it does **not** establish this
> repository or ref as the authoritative program coordinate. A measured baseline is not silently
> converted into an authoritative repository designation.

---

## 2. DECLARATION (as recorded in IRR — Ramki, Program Authority, 2026-10-03)

> ### DECLARATION 1 OF 2 — NP-15 Phase 1 (1A + 1B + 1C): **CONVERGED**

| Phase | Coordinate | Declared state |
|---|---|---|
| **1A** | `f13002e4e…` — 2026-09-22T16:08:42Z | **DECLARED CONVERGED** at its historical execution. Shell (9 files) + presentation kit (11 API-pure + 2 hooks) + `FeaturePlaceholder`. 13 route constants; nav 2 implemented / 11 future. `npm test` 374/374, 58 suites, 0 fail; `tsc` clean; `vite build` OK. Boundary trees byte-identical: `src/identity` `9080e997`, `src/d114` `0062ad52`, `frontend/src/features/portfolio` `8491efdc`. **Declared as executed at `f13002e` — NOT as restored by Phase 5.** |
| **1B** | `144e8edf8…` — 2026-09-22T16:33:29Z | **DECLARED CONVERGED**. BI-08 PortfolioWorkspace mounted at `/portfolio`; Tier-B singletons hoisted. BI tree frozen `8491efdc` **UNCHANGED** through Phase 5. Windows visual-evidence intake **ACCEPTED WITH RECORDED DISCREPANCY** (Phase-1B scope only). |
| **1C** | `bc3fb80a3…` — 2026-09-22T17:52:11Z | **GOVERNANCE GATE CLOSED — DEFERRED COMPLETION AUTHORIZED.** Governance-only, **zero code change**. **NOT functional completion of Intelligence.** `/intelligence` (UI04) remains **`partial`**; Decision Matrix `unavailable`; **M-1..M-5 remain OPEN**. |

> ### DECLARATION 2 OF 2 — Phase 5 Option A: **CONVERGED (SEPARATE WORKSTREAM)**

| Phase | Coordinate | Declared state |
|---|---|---|
| **5** | `6b8afda47…` — 2026-09-23T07:50:03Z; result `28a6ed283…` | **DECLARED CONVERGED** as a **SEPARATE later shell-restoration/superseding workstream** — **not retroactively incorporated into narrow NP-15 Phase 1**. 36 route constants, 29 rendered paths, 32 nav items, new `unavailable` status; `OfflineOverlays.tsx` + `UnavailableSurface.tsx` added. |

**Declaring authority:** **Ramki (Program Authority)** — designated by **D-NP15-10**, 2026-10-03.
**Recording agent:** Arena Agent Mode. **Recording only — the agent does not declare.**

---

## 3. WHY TWO SEPARATE DECLARATIONS (D-NP15-9 = BOTH)

Measured commit evidence:

```text
f13002e  Phase 1A   ADDED app/routes.ts, app/navigation.ts, app/AppShell.tsx
                    ADDED tests/shell_navigation_model.test.ts
                    → 13 route constants, nav 2 implemented / 11 future

144e8ed  Phase 1B   ADDED tests/shell_mount_bi08_route.test.ts
bc3fb80  Phase 1C   governance record only — ZERO code change

6b8afda  Phase 5    MODIFIED app/App.tsx, app/AppShell.tsx, app/navigation.ts, app/routes.ts
                    ADDED    app/OfflineOverlays.tsx, app/UnavailableSurface.tsx
                    MODIFIED tests/shell_navigation_model.test.ts     ← Phase-1A test
                    MODIFIED tests/shell_mount_bi08_route.test.ts     ← Phase-1B test
                    ADDED    tests/shell_offline_full_shell_restoration.test.ts
                    → 36 route constants, 32 nav items, `unavailable` status
```

**Phase 5 directly modifies Phase-1A-created files and both the Phase-1A and Phase-1B test files.**
The shell at IPD `main` is therefore the Phase-5 restoration, **not** the Phase-1A artifact. Under
**D-NP15-9 = BOTH**, each is declared against its own execution coordinate. Phase 5 is **not**
silently incorporated into Phase 1 merely because its resulting files are present at IPD `main`.

**Not superseded by Phase 5:** Phase 1A's presentation kit (`components/**`) and
`FeaturePlaceholder`; Phase 1B's BI-08 mount (frozen `8491efdc`, UNCHANGED).

---

## 4. BASELINE VERIFICATION EVIDENCE (IPD `main` `4d3e1cdc…`)

| Check | Result |
|---|---|
| `npm ci` | OK |
| `npm run build:tsc` | **PASS** |
| `npm test` | **542 tests · 83 suites · 542 pass · 0 fail · 0 skipped** |
| Frozen `frontend/src/features/portfolio` | `8491efdc44ae449eedf1aaf93fbc7415c428fcb9` — matches |
| Frozen `src/identity` | `9080e997ee7da977d0066431737e329e88b3c0b7` — matches |
| Frozen `src/d114` | `0062ad520dce647f3d02ed9a27739598d457faaa` — matches |
| Frozen `src/ui` | `1597ed0663ee6a450dac7e9c6959748a1a85b05e` — matches |
| Worktree clean; `local == remote` | **VERIFIED** |
| OQ-1 / OQ-2 | Resolved as recommended; recorded in `frontend/src/app/routes.ts` header — *"OQ-1 = Option A, OQ-2 = c440"* |

### Windows acceptance — evidence-calibrated

* **Phase-1B Windows visual-evidence intake: ACCEPTED WITH RECORDED DISCREPANCY.**
  Gate `GATE-WINDOWS-PHASE-1B-VISUAL-EVIDENCE-INTAKE`.
  The discrepancy **is explained by execution against stale precompiled `dist/` artifacts; the
  original measurement is therefore not accepted as representative of the Phase-1B source state.**
* **Broader Phase-8 Windows acceptance: NOT HELD.**
  `82 + 66 = 148` and 7 Executive widgets remain **NOT CLAIMABLE**.

The accepted Phase-1B evidence is **not** converted into a claim that the complete Phase-8 Windows
condition passed.

---

## 5. WHAT THIS DECLARATION DOES **NOT** MEAN

The following remain **UNRESOLVED** and must not be interpreted as settled by NP-15:

| # | Matter | State |
|---|---|---|
| 1 | **IRR↔IPD dependency compatibility** | IRR pins IPD at `0dab1221`, a commit **not on IPD `main`**. IPD `main` has **no `exports` map**; the `iips-production-market-data/pit` subpath exists only from `0dab1221`. **IRR cannot build against IPD `main`.** |
| 2 | **IPD ref designation** | `4d3e1cdc…` is **MEASURED**. **D-NP15-2 OPEN.** Three unmerged IPD heads (`6828155`, `2e11fa3`, `42f91fa`) plus the off-main pin. |
| 3 | **Persistence convergence** | Two mutually exclusive lineages — NP04-G24 (`6828155`, `better-sqlite3`) vs NP-04 (`2e11fa3`, `node:sqlite`). 50 files, +1,842/−8,184. Conflicting `src/persistence/{errors,index}.ts`. Domain boundary **NOT YET WRITTEN**. |
| 4 | **Engine-taxonomy equivalence** | NOT established. |
| 5 | **NP-13 completion** | NOT complete. D1 complete; D2 eligible; D2-A/B/C **NOT DECIDED**; **no ref bound**; IPD **out of scope** in every NP-13 record. |
| 6 | **IU-7** | **NOT RECONSTRUCTED** — 2 mentions only, both inside IRR G-2 §8; 0 artifacts, 0 commits, 0 PRs. |
| 7 | **IRR HEAD green** | **NO** — 2 failed / 272 passed / 25 skipped. |
| 8 | **Production readiness** | NOT established. `productionEligible = false`; 0 providers / 0 sockets / 0 credentials. |
| 9 | **Full IIPS convergence** | NOT established. Terminal inventory classification **B**. |
| 10 | **Phase-8 Windows acceptance** | **NOT HELD.** |
| 11 | **Intelligence functional completion** | **NO** — Phase-1C governance gate closed / deferred completion authorized only. `/intelligence` = `partial`; M-1..M-5 OPEN. |

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
Client-side authentication .......... NONE (0 keycloak / oidc / authFetch in frontend/src)
Implementation authority ............ NOT GRANTED / NOT CLAIMED
```

---

*End of `NP-15-PHASE1-CONVERGENCE-DECLARATION-EVIDENCE-01`.
Additive governance/evidence artifact only. No source, configuration, schema, persistence,
dependency-pin, branch-topology, engine-taxonomy, deployment, or production change.
No branch merged. No rebase. No cherry-pick. No implementation authority claimed or inferred.*
